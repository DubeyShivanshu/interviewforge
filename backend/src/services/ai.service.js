const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// Retry helper — retries fn up to `retries` times with exponential backoff
// Only retries on 503 / UNAVAILABLE (model overload), not on quota errors
async function withRetry(fn, retries = 3, baseDelayMs = 2000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn()
        } catch (err) {
            const msg = err.message || ""
            const isOverloaded = msg.includes("503") || msg.includes("UNAVAILABLE")
            if (isOverloaded && attempt < retries) {
                const delay = baseDelayMs * attempt   // 2s, 4s, 6s
                console.warn(`Gemini 503 — retrying in ${delay}ms (attempt ${attempt}/${retries})`)
                await new Promise(resolve => setTimeout(resolve, delay))
            } else {
                throw err
            }
        }
    }
}

//interview report schema
const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

//Generate interview report
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `
    You are an expert technical interviewer and career coach.
    Analyze the candidate's resume, self description, and job description below.
    Generate a complete interview preparation report.

    Resume:
    ${resume}

    Self Description:
    ${selfDescription}

    Job Description:
    ${jobDescription}

    Return ONLY a valid JSON object with this EXACT structure. No explanation, no markdown, just raw JSON.

    {
    "matchScore": <number between 0 and 100>,
    "title": "<job title extracted from job description>",
    "technicalQuestions": [
        {
        "question": "<technical question 1 based on job description and resume>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<detailed answer with key points, approach, and examples>"
        },
        {
        "question": "<technical question 2>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<detailed answer>"
        },
        {
        "question": "<technical question 3>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<detailed answer>"
        },
        {
        "question": "<technical question 4>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<detailed answer>"
        },
        {
        "question": "<technical question 5>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<detailed answer>"
        }
    ],
    "behavioralQuestions": [
        {
        "question": "<behavioral question 1 based on job requirements>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<how to answer this using the STAR method with specific examples>"
        },
        {
        "question": "<behavioral question 2>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<STAR method answer>"
        },
        {
        "question": "<behavioral question 3>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<STAR method answer>"
        },
        {
        "question": "<behavioral question 4>",
        "intention": "<why the interviewer asks this question>",
        "answer": "<STAR method answer>"
        }
    ],
    "skillGaps": [
        {
        "skill": "<skill the candidate is missing or weak in based on job description>",
        "severity": "high"
        },
        {
        "skill": "<another missing skill>",
        "severity": "medium"
        },
        {
        "skill": "<another missing skill>",
        "severity": "medium"
        },
        {
        "skill": "<another missing skill>",
        "severity": "low"
        }
    ],
    "preparationPlan": [
        {
        "day": 1,
        "focus": "<main focus topic for day 1>",
        "tasks": ["<specific task 1>", "<specific task 2>", "<specific task 3>"]
        },
        {
        "day": 2,
        "focus": "<main focus topic for day 2>",
        "tasks": ["<specific task 1>", "<specific task 2>", "<specific task 3>"]
        },
        {
        "day": 3,
        "focus": "<main focus topic for day 3>",
        "tasks": ["<specific task 1>", "<specific task 2>", "<specific task 3>"]
        },
        {
        "day": 4,
        "focus": "<main focus topic for day 4>",
        "tasks": ["<specific task 1>", "<specific task 2>", "<specific task 3>"]
        },
        {
        "day": 5,
        "focus": "<main focus topic for day 5>",
        "tasks": ["<specific task 1>", "<specific task 2>", "<specific task 3>"]
        }
    ]
    }

    STRICT RULES - YOU MUST FOLLOW THESE:
    - technicalQuestions MUST have exactly 5 real objects, NOT empty array
    - behavioralQuestions MUST have exactly 4 real objects, NOT empty array
    - skillGaps MUST have exactly 4 real objects, NOT empty array
    - preparationPlan MUST have exactly 5 real objects (day 1 to day 5), NOT empty array
    - severity must only be one of: "low", "medium", "high"
    - Replace ALL placeholder text like <...> with actual real content
    - Do NOT return empty arrays under any circumstance
    `

    const response = await withRetry(() =>
        ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        })
    )

    return JSON.parse(response.text)
}

//func for pdf generation
async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,   // "new" was deprecated
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",         
            "--disable-gpu"
        ]
    })
    const page = await browser.newPage();

    // Block external network requests (Google Fonts, CDNs, images, scripts)
    // These cause "fetch failed" when unreachable and are not needed for PDF layout
    await page.setRequestInterception(true)
    page.on("request", (req) => {
        const type = req.resourceType()
        if (["image", "media", "script", "font", "stylesheet"].includes(type) && req.url().startsWith("http")) {
            // only abort requests to external URLs — allow inline data: URIs
            if (!req.url().startsWith("data:")) {
                req.abort()
                return
            }
        }
        req.continue()
    })

    // add timeout to prevent hanging
    await page.setDefaultNavigationTimeout(60000)
    await page.setDefaultTimeout(60000)

    // domcontentloaded: don't wait for external resources to settle (avoids fetch failed)
    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" })    

    const pdfBuffer = await page.pdf({
        format: "A4",
        margin: {
            top: "10mm",
            bottom: "10mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

//Puppeteer(convert HTML to Pdf)
async function generateResumePdf({resume, selfDescription, jobDescription}){
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate a highly professional, ATS-optimized resume.
                    
Resume Data: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

STRICT INSTRUCTIONS:
1. Return a JSON object with a single field "html".
2. You MUST use this EXACT CSS inside the <style> tag to ensure it fits perfectly on ONE A4 page:
   body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 10.5pt; line-height: 1.3; color: #000; margin: 0; padding: 0; }
   h1 { font-size: 16pt; margin: 0 0 4px 0; text-align: center; text-transform: uppercase; }
   h2 { font-size: 12pt; margin: 12px 0 4px 0; border-bottom: 1px solid #000; padding-bottom: 2px; text-transform: uppercase; }
   p, li { margin: 0 0 4px 0; }
   ul { margin: 0; padding-left: 18px; }
   .header-info { text-align: center; font-size: 9.5pt; margin-bottom: 12px; }
   .flex-between { display: flex; justify-content: space-between; align-items: baseline; }
3. EXTREMELY IMPORTANT: Be concise. Maximum 3-4 bullet points per work experience. Do not write lengthy paragraphs.
4. DO NOT use fancy colors or complex grids. Standard single-column black-and-white text is required for ATS parsing.
5. Tailor the content to the Job Description, highlighting matching skills.
`
    const response = await withRetry(() =>
        ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                //responseSchema: zodToJsonSchema(resumePdfSchema),
            }
        })
    )

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer
}

module.exports = { generateInterviewReport, generateResumePdf }
