const { Mistral } = require("@mistralai/mistralai");
const puppeteer = require("puppeteer");

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_KEY,
});

const MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest";

// Terminal UI Colors for Agent Logs
const colors = {
  reset: "\x1b[0m",
  agent: "\x1b[36m", // Cyan
  tool: "\x1b[35m",  // Magenta
  success: "\x1b[32m", // Green
  error: "\x1b[31m", // Red
};

/**
 * Robust retry handler for Mistral API calls to handle free-tier rate limits (429)
 */
async function callMistralWithRetry(apiFn, maxRetries = 4, initialDelayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiFn();
    } catch (error) {
      attempt++;
      const isRateLimit =
        error?.status === 429 ||
        error?.raw_status_code === 429 ||
        error?.statusCode === 429 ||
        (error?.message &&
          (error.message.includes("429") ||
            error.message.includes("Rate limit") ||
            error.message.includes("rate_limited")));

      if (isRateLimit && attempt < maxRetries) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.warn(`${colors.agent}[Mistral Rate Limit 429] ⏳ Waiting ${delay}ms before retry attempt ${attempt}/${maxRetries}...${colors.reset}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}

// ==========================================
// 🛠️ TOOL IMPLEMENTATIONS (Agent Capabilities)
// ==========================================
async function fetchCompanyWiki(companyName) {
  try {
    console.log(`${colors.tool}[Tool: Web Search] 🌐 Fetching live Wikipedia data for: ${companyName}${colors.reset}`);
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(companyName)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.log(`${colors.error}[Tool: Web Search] ⚠️ No public Wikipedia information found.${colors.reset}`);
      return `No public Wikipedia information found for ${companyName}.`;
    }
    const data = await response.json();
    console.log(`${colors.success}[Tool: Web Search] ✅ Successfully retrieved company context!${colors.reset}`);
    return data.extract || `Limited information found for ${companyName}.`;
  } catch (error) {
    console.log(`${colors.error}[Tool: Web Search] ❌ Error fetching data.${colors.reset}`);
    return `Error fetching company info for ${companyName}.`;
  }
}

// Tool definitions for the LLM
const agentTools = [
  {
    type: "function",
    function: {
      name: "fetchCompanyWiki",
      description: "Search for background information, history, and culture of a specific company. Use this if a company name is mentioned in the job description.",
      parameters: {
        type: "object",
        properties: {
          companyName: {
            type: "string",
            description: "The name of the company to search for.",
          },
        },
        required: ["companyName"],
      },
    },
  },
];

// ==========================================
// 🤖 AGENT 1: CONTEXT GATHERER (Tool Calling)
// ==========================================
async function gatherCompanyContext(jobDescription) {
  try {
    console.log(`\n${colors.agent}[Agent 1: Context Gatherer] 🧠 Analyzing Job Description for entities...${colors.reset}`);
    
    const prompt = `Analyze this job description. If a company name is explicitly mentioned or strongly implied, use the fetchCompanyWiki tool to gather context about their business and culture.\n\nJob Description:\n${jobDescription.slice(0, 2000)}`;

    const response = await callMistralWithRetry(() =>
      mistral.chat.complete({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        tools: agentTools,
        toolChoice: "auto",
      }),
      2,
      1500
    );

    const message = response.choices[0].message;
    
    // Check if the agent decided to use a tool
    if (message.toolCalls && message.toolCalls.length > 0) {
      const toolCall = message.toolCalls[0];
      if (toolCall.function.name === "fetchCompanyWiki") {
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`${colors.agent}[Agent 1: Context Gatherer] 🎯 Identified Target Company: ${args.companyName}. Triggering Tool...${colors.reset}`);
        const companyInfo = await fetchCompanyWiki(args.companyName);
        return `Company Context (${args.companyName}): ${companyInfo}`;
      }
    }
    
    console.log(`${colors.agent}[Agent 1: Context Gatherer] ℹ️ No specific company identified. Proceeding with generic context.${colors.reset}`);
    return "Company Context: Generic or undisclosed company.";
  } catch (error) {
    console.warn(`${colors.agent}[Agent 1: Context Gatherer] ⚠️ Skipping dynamic context gathering due to rate limit/error: ${error.message}${colors.reset}`);
    return "Company Context: Generic or undisclosed company.";
  }
}

// ==========================================
// 🤖 AGENT 2: REPORT SYNTHESIZER
// ==========================================
async function generateInterviewReport({
  selfDescription,
  resume,
  jobDescription,
}) {
  // Step 1: Orchestrate the context gathering agent
  const companyContext = await gatherCompanyContext(jobDescription);
  
  // Rate pacing buffer for free-tier limits
  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log(`${colors.agent}[Agent 2: Report Synthesizer] ✍️ Generating tailored Interview Report (Strict JSON)...${colors.reset}`);

  // Step 2: Final synthesis
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

  const response = await callMistralWithRetry(() =>
    mistral.chat.complete({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" },
    }),
    5,
    2500
  );

  const text = response.choices[0].message.content;
  console.log(`${colors.success}✨ Agent Pipeline Complete! Successfully generated JSON Report.${colors.reset}\n`);
  return JSON.parse(text);
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

  const response = await callMistralWithRetry(() =>
    mistral.chat.complete({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      responseFormat: { type: "json_object" },
    }),
    5,
    2500
  );

  const text = response.choices[0].message.content;
  const result = JSON.parse(text);
  const htmlContent = result.resume;
  
  console.log(`${colors.tool}[Tool: Puppeteer] 🖨️ Converting HTML to PDF...${colors.reset}`);
  const pdfBuffer = await convertHTMLtoPDF(htmlContent);
  
  console.log(`${colors.success}✨ ATS Resume generated successfully!${colors.reset}\n`);
  return pdfBuffer;
}

module.exports = { generateInterviewReport, generateResumePDF };
