const { Mistral } = require("@mistralai/mistralai");
const puppeteer = require("puppeteer");

// Supported free-tier models in priority order
const MISTRAL_MODELS = [
  process.env.MISTRAL_MODEL,
  "open-mistral-nemo",
  "mistral-small-latest",
  "open-mistral-7b",
].filter(Boolean);

const colors = {
  reset: "\x1b[0m",
  agent: "\x1b[36m",
  tool: "\x1b[35m",
  success: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

// ==========================================
// 🔧 ROBUST JSON REPAIR UTILITY
// ==========================================
function safeJSONParse(raw) {
  if (!raw) throw new Error("Empty response from AI");

  // Strip markdown code fences
  let clean = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Extract the outermost JSON object
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    clean = clean.slice(start, end + 1);
  }

  // Try direct parse first
  try {
    return JSON.parse(clean);
  } catch (e1) {
    // Attempt repair: remove trailing commas before } or ]
    const repaired = clean
      .replace(/,\s*([}\]])/g, "$1")
      // Remove control characters that break JSON
      .replace(/[\x00-\x1F\x7F]/g, " ");

    try {
      return JSON.parse(repaired);
    } catch (e2) {
      // Last resort: try to extract partial data with a forgiving regex
      const result = {};

      // Extract score
      const scoreMatch = clean.match(/"score"\s*:\s*(\d+)/);
      if (scoreMatch) result.score = Number(scoreMatch[1]);

      // Extract title
      const titleMatch = clean.match(/"title"\s*:\s*"([^"]+)"/);
      if (titleMatch) result.title = titleMatch[1];

      if (result.score !== undefined || result.title) {
        // Return with empty arrays, sanitizer in controller will fill defaults
        return {
          score: result.score || 75,
          title: result.title || "Interview Prep",
          technicalQuestions: [],
          behavioralQuestions: [],
          skillGap: [],
          preparationPlan: [],
        };
      }

      throw new Error(`JSON parse failed after repair attempt: ${e2.message.slice(0, 120)}`);
    }
  }
}

// ==========================================
// 🛠️ COMPANY CONTEXT (no extra API call)
// ==========================================
function extractCompanyFromJobDescription(text) {
  if (!text) return null;
  const patterns = [
    /(?:at|@|for|joining|join|about)\s+([A-Z][A-Za-z0-9&]{1,25})/,
    /(?:company|organization|client|employer):\s*([A-Z][A-Za-z0-9&]{1,25})/i,
    /([A-Z][A-Za-z0-9&]{1,25})\s+(?:is looking for|is hiring|is seeking)/,
  ];
  const ignoreWords = new Set([
    "The","A","An","We","Our","This","You","Your","Senior","Junior",
    "Lead","Staff","Principal","Software","Backend","Frontend","Fullstack",
    "Engineer","Developer","Manager","Tech","The","Looking","Seeking","Hiring",
  ]);
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && !ignoreWords.has(match[1].trim())) {
      return match[1].trim();
    }
  }
  return null;
}

async function fetchCompanyWiki(companyName) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(companyName)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!response.ok) return "";
    const data = await response.json();
    // Return max 300 chars of extract to keep prompt size small
    return (data.extract || "").slice(0, 300);
  } catch {
    return "";
  }
}

async function getCompanyContext(jobDescription) {
  const company = extractCompanyFromJobDescription(jobDescription);
  if (company) {
    const info = await fetchCompanyWiki(company);
    if (info) return `Company: ${company}. ${info}`;
  }
  return "";
}

// ==========================================
// 🤖 GEMINI FALLBACK
// ==========================================
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No GEMINI_API_KEY configured");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return safeJSONParse(text);
}

// ==========================================
// 🤖 MULTI-MODEL RUNNER WITH ROBUST PARSING
// ==========================================
async function callAI(prompt) {
  if (!process.env.MISTRAL_KEY && process.env.GEMINI_API_KEY) {
    return callGeminiAPI(prompt);
  }

  const mistral = new Mistral({ apiKey: process.env.MISTRAL_KEY });
  let lastError = null;

  for (const model of MISTRAL_MODELS) {
    console.log(`${colors.agent}[AI] Trying model: ${model}...${colors.reset}`);
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await mistral.chat.complete({
          model,
          messages: [{ role: "user", content: prompt }],
          responseFormat: { type: "json_object" },
          maxTokens: 2000,
        });
        const raw = response.choices[0].message.content;
        const parsed = safeJSONParse(raw);
        console.log(`${colors.success}✨ Succeeded with ${model}!${colors.reset}`);
        return parsed;
      } catch (err) {
        lastError = err;
        const isRate =
          err?.status === 429 ||
          err?.raw_status_code === 429 ||
          (err?.message || "").includes("429") ||
          (err?.message || "").includes("rate_limit");

        if (isRate && attempt < 3) {
          const delay = 2000 * attempt;
          console.warn(`${colors.warn}[Rate limit on ${model}] Waiting ${delay}ms...${colors.reset}`);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          console.warn(`${colors.warn}[Error on ${model}]: ${err.message?.slice(0, 80)}${colors.reset}`);
          break;
        }
      }
    }
  }

  if (process.env.GEMINI_API_KEY) {
    console.log(`${colors.agent}[Fallback] Switching to Gemini...${colors.reset}`);
    try {
      return await callGeminiAPI(prompt);
    } catch (gErr) {
      console.error("Gemini fallback failed:", gErr.message);
    }
  }

  throw lastError || new Error("All AI models failed. Please try again in a moment.");
}

// ==========================================
// 🤖 INTERVIEW REPORT GENERATOR
// ==========================================
async function generateInterviewReport({ selfDescription, resume, jobDescription }) {
  // Truncate inputs to prevent prompt overflow and JSON corruption
  const truncatedResume = (resume || "").slice(0, 1500);
  const truncatedJD = (jobDescription || "").slice(0, 1000);
  const truncatedSelf = (selfDescription || "").slice(0, 500);

  console.log(`${colors.agent}[Agent] Gathering company context...${colors.reset}`);
  const companyContext = await getCompanyContext(truncatedJD);

  console.log(`${colors.agent}[Agent] Generating interview report...${colors.reset}`);

  const prompt = `You are a senior technical interviewer. Generate a concise interview prep report as VALID JSON only.
${companyContext ? `Context: ${companyContext}` : ""}

RULES:
- Output ONLY raw JSON, no markdown, no explanation, no code fences
- Keep each answer under 150 words as plain text (NO nested objects or arrays inside string fields)
- Generate exactly 5 technical questions, 4 behavioral questions, 4 skill gaps, 5 prep days

JSON schema (fill all "..." with strings):
{
  "title": "2-3 word title",
  "score": 78,
  "technicalQuestions": [
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."}
  ],
  "behavioralQuestions": [
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."},
    {"question":"...","intention":"...","answer":"..."}
  ],
  "skillGap": [
    {"skill":"...","severity":"High"},
    {"skill":"...","severity":"Medium"},
    {"skill":"...","severity":"Low"},
    {"skill":"...","severity":"Medium"}
  ],
  "preparationPlan": [
    {"day":"Day 1","focus":"...","tasks":["...","...","..."]},
    {"day":"Day 2","focus":"...","tasks":["...","...","..."]},
    {"day":"Day 3","focus":"...","tasks":["...","...","..."]},
    {"day":"Day 4","focus":"...","tasks":["...","...","..."]},
    {"day":"Day 5","focus":"...","tasks":["...","...","..."]}
  ]
}

Resume summary: ${truncatedResume}
Candidate: ${truncatedSelf}
Role: ${truncatedJD}
`;

  const data = await callAI(prompt);
  console.log(`${colors.success}✨ Report generated!${colors.reset}`);
  return data;
}

// ==========================================
// 🤖 ATS RESUME PDF GENERATOR
// ==========================================
async function convertHTMLtoPDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle2" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePDF({ resume, jobDescription, selfDescription }) {
  console.log(`${colors.agent}[Agent] Generating ATS Resume...${colors.reset}`);
  const prompt = `You are an ATS Resume expert. Output ONLY valid JSON with a single key "resume" containing a complete HTML document as a string value.
INPUTS:
- Resume: ${(resume || "").slice(0, 1200)}
- Job: ${(jobDescription || "").slice(0, 600)}
- About: ${(selfDescription || "").slice(0, 300)}
RULES: Single-column layout, Google Fonts Inter, dark navy headings, embedded CSS in <style> tag, no external images. Output ONLY {"resume":"<html>...</html>"}.`;

  const result = await callAI(prompt);
  const htmlContent = result.resume;
  if (!htmlContent) throw new Error("Resume generation returned empty HTML");

  console.log(`${colors.tool}[Puppeteer] Converting to PDF...${colors.reset}`);
  const pdfBuffer = await convertHTMLtoPDF(htmlContent);
  console.log(`${colors.success}✨ Resume PDF ready!${colors.reset}`);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePDF };
