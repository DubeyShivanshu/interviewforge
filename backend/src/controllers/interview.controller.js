const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @desc Controller to generate interview report based on user resume, self & job desc
 */
async function generateInterviewReportController(req, res){
    try {
        // B1 FIX: guard against missing file upload
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a PDF resume." })
        }

        //Parse PDF    
        const pdfData = await pdfParse(req.file.buffer)
        const resumeContent = pdfData.text

        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required." })
        }

        //Generate AI report
        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription,
            jobDescription
        })

        //Save to DB
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription,
            jobDescription,
            ...interviewReportByAi   //{ questions, answers }
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })

    } catch (error) {
        console.error("Interview Report Error:", error.message)
        
        if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
            return res.status(429).json({
                message: "AI quota exceeded. Please try again tomorrow."
            })
        }
        if (error.message?.includes("503") || error.message?.includes("UNAVAILABLE")) {
            return res.status(503).json({
                message: "AI model is busy right now. Please try again in a moment."
            })
        }
        res.status(500).json({ message: "Something went wrong" })
    }
}

/**
 * @desc Controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req, res){
    try {
        const { interviewId } = req.params;

        const interviewReport = await interviewReportModel.findOne({_id: interviewId, user: req.user.id});

        if(!interviewReport){
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Get Report Error:", error.message)
        res.status(500).json({ message: "Something went wrong" })
    }
}

/**
 * @desc Controller to get all interview reports of the logged in user
 */
async function getAllInterviewReportsController(req, res){
    try {
        const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({createdAt: -1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("Get Reports Error:", error.message)
        res.status(500).json({ message: "Something went wrong" })
    }
}

/**
 * @desc Controller to generate resume PDF (using Puppeteer) based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try{
        const { interviewReportId } = req.params

        // B2 FIX: ownership check — only the owner can generate their resume PDF
        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        res.send(pdfBuffer)
    } catch(error){
        console.error("Resume PDF Error:", error.message)
        if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
            return res.status(429).json({
                message: "AI quota exceeded. Please try again tomorrow."
            })
        }
        if (error.message?.includes("503") || error.message?.includes("UNAVAILABLE")) {
            return res.status(503).json({
                message: "AI model is busy right now. Please try again in a moment."
            })
        }
        res.status(500).json({ message: "Something went wrong generating the PDF" })
    }  
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,   
    generateResumePdfController
}

