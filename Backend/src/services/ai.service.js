const { Mistral } = require("@mistralai/mistralai");
const puppeteer = require("puppeteer");

// Supported free-tier models in priority order
const MISTRAL_MODELS = [
  process.env.MISTRAL_MODEL,
  "open-mistral-nemo",
  "mistral-small-latest",
  "open-mistral-7b"
].filter(Boolean);

// Terminal UI Colors for Agent Logs
const colors = {
  reset: "\x1b[0m",
  agent: "\x1b[36m", // Cyan
  tool: "\x1b[35m",  // Magenta
  success: "\x1b[32m", // Green
  warn: "\x1b[33m",   // Yellow
  error: "\x1b[31m", // Red
};

// ==========================================
// 🛠️ TOOL 1: FAST COMPANY EXTRACTION & WIKI
// ==========================================
function extractCompanyFromJobDescription(text) {
  if (!text) return null;
  const patterns = [
    /(?:at|@|for|joining|join|about)\s+([A-Z][A-Za-z0-9&]{1,25})/i,
    /(?:company|organization|client|employer):\s*([A-Z][A-Za-z0-9&]{1,25})/i,
    /([A-Z][A-Za-z0-9&]{1,25})\s+(?:is looking for|is hiring|is seeking)/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      const ignoreWords = ["The", "A", "An", "We", "Our", "This", "You", "Your", "Senior", "Junior", "Lead", "Staff", "Principal", "Software", "Backend", "Frontend", "Fullstack", "Engineer", "Developer", "Manager", "Tech"];
      if (!ignoreWords.includes(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

async function fetchCompanyWiki(companyName) {
  try {
    console.log(`${colors.tool}[Tool: Web Search] 🌐 Fetching live Wikipedia data for: ${companyName}${colors.reset}`);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(companyName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      return `No public Wikipedia information found for ${companyName}.`;
    }
    const data = await response.json();
    console.log(`${colors.success}[Tool: Web Search] ✅ Retrieved company context for ${companyName}!${colors.reset}`);
    return data.extract || `Limited information found for ${companyName}.`;
  } catch (error) {
    return `Error fetching company info for ${companyName}.`;
  }
}

async function gatherCompanyContext(jobDescription) {
  const company = extractCompanyFromJobDescription(jobDescription);
  if (company) {
    const wiki = await fetchCompanyWiki(company);
    return `Company Context (${company}): ${wiki}`;
  }
  return "Company Context: Generic tech company interview.";
}

// ==========================================
// 🤖 MULTI-MODEL MISTRAL & GEMINI RUNNER
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
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return JSON.parse(text);
}

async function callMistralWithModelFallback(prompt) {
  if (!process.env.MISTRAL_KEY && process.env.GEMINI_API_KEY) {
    return await callGeminiAPI(prompt);
  }

  const mistral = new Mistral({
    apiKey: process.env.MISTRAL_KEY,
  });

  let lastError = null;

  for (const model of MISTRAL_MODELS) {
    console.log(`${colors.agent}[AI Agent] 🚀 Generating with model: ${model}...${colors.reset}`);
    
    // Try up to 2 retries per model with backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await mistral.chat.complete({
          model: model,
          messages: [{ role: "user", content: prompt }],
          ...(model !== "open-mistral-7b" ? { responseFormat: { type: "json_object" } } : {})
        });

        const rawContent = response.choices[0].message.content;
        // Clean JSON markdown fences if present
        const cleanContent = rawContent.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1");
        const parsed = JSON.parse(cleanContent);
        console.log(`${colors.success}✨ Generation succeeded with ${model}!${colors.reset}`);
        return parsed;
      } catch (error) {
        lastError = error;
        const isRateLimit =
          error?.status === 429 ||
          error?.raw_status_code === 429 ||
          error?.message?.includes("429") ||
          error?.message?.includes("Rate limit") ||
          error?.message?.includes("rate_limited");

        if (isRateLimit) {
          console.warn(`${colors.warn}[Rate Limit 429 on ${model}] Attempt ${attempt}/2: Backing off 1.5s...${colors.reset}`);
          await new Promise(r => setTimeout(r, 1500 * attempt));
        } else {
          console.warn(`${colors.warn}[Error on ${model}]: ${error.message}. Trying next fallback model...${colors.reset}`);
          break; // Try next model immediately for non-rate-limit errors
        }
      }
    }
  }

  // If Mistral is completely rate limited and GEMINI_API_KEY is available, fallback to Gemini
  if (process.env.GEMINI_API_KEY) {
    console.log(`${colors.agent}[AI Fallback] 🌐 Mistral limit reached. Falling back to Google Gemini...${colors.reset}`);
    try {
      return await callGeminiAPI(prompt);
    } catch (gErr) {
      console.error("Gemini fallback failed:", gErr);
    }
  }

  throw lastError || new Error("All AI models are currently rate limited. Please try again in a few seconds.");
}

// ==========================================
// 🤖 AGENT 2: REPORT SYNTHESIZER
// ==========================================
async function generateInterviewReport({
  selfDescription,
  resume,
  jobDescription,
}) {
  console.log(`\n${colors.agent}[Agent 1: Context Gatherer] 🧠 Analyzing Job Description...${colors.reset}`);
  const companyContext = await gatherCompanyContext(jobDescription);
  
  console.log(`${colors.agent}[Agent 2: Report Synthesizer] ✍️ Generating tailored Interview Report (Strict JSON)...${colors.reset}`);

  const prompt = `
You are an expert Technical Interviewer and HR Manager.
Generate a tailored interview preparation report.

DYNAMIC CONTEXT:
- ${companyContext}
(Use this context to tailor the behavioral questions specifically to the company's domain and history, if available).

STRICT RULES:
- Return ONLY valid JSON.
- Do NOT include explanations or markdown.
- Follow the schema EXACTLY.
- Do NOT add extra fields.

REQUIRED JSON STRUCTURE:
{
  "technicalQuestions": [{ "question": "...", "intention": "...", "answer": "..." }],
  "behavioralQuestions": [{ "question": "...", "intention": "...", "answer": "..." }],
  "skillGap": [{ "skill": "...", "severity": "Low|Medium|High" }],
  "preparationPlan": [{ "day": "Day 1", "focus": "...", "tasks": ["..."] }],
  "title": "Title in 2 to 3 words",
  "score": 0
}

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  const reportData = await callMistralWithModelFallback(prompt);
  console.log(`${colors.success}✨ Report synthesized successfully!${colors.reset}\n`);
  return reportData;
}

// ==========================================
// 🤖 AGENT 3: ATS RESUME BUILDER
// ==========================================
async function convertHTMLtoPDF(htmlContent) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, {
    waitUntil: "networkidle2",
  });
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });
  await browser.close();
  return pdfBuffer;
}

async function generateResumePDF({ resume, jobDescription, selfDescription }) {
  console.log(`\n${colors.agent}[Agent 3: ATS Architect] 📄 Generating ATS-Optimized HTML Resume...${colors.reset}`);
  
  const prompt = `
You are an expert ATS Resume Architect Agent.

Create a STUNNING, ATS-optimized HTML resume tailored to this job.

INPUTS:
- Current Resume: ${resume}
- Job Description: ${jobDescription}  
- Candidate's Self Description: ${selfDescription}

RULES:
- Tailor EVERY bullet point to match keywords from the job description
- Quantify achievements (e.g., "Increased performance by 40%")
- Use strong action verbs (Architected, Delivered, Scaled)
- Remove irrelevant experience
- Single/two-column layout, Google Fonts (Inter/Roboto)
- Dark navy (#1a2332) for headings, styled skills chips.
- Embed ALL styles in a <style> tag inside <head>.
- Do NOT use external images.

OUTPUT: Return ONLY a JSON object with a single key "resume" whose value is the complete HTML document string. No extra text.
`;

  const result = await callMistralWithModelFallback(prompt);
  const htmlContent = result.resume;
  
  console.log(`${colors.tool}[Tool: Puppeteer] 🖨️ Converting HTML to PDF...${colors.reset}`);
  const pdfBuffer = await convertHTMLtoPDF(htmlContent);
  
  console.log(`${colors.success}✨ ATS Resume generated successfully!${colors.reset}\n`);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePDF };
