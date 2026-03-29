const pdfParse = require("pdf-parse")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

/**
 * @desc Controller to generate interview report based on user resume, self & job desc
 */
async function generateInterviewReportController(req, res){
    try {
        //Parse PDF    
        const pdfData = await pdfParse(req.file.buffer)
        const resumeContent = pdfData.text

        const { selfDescription, jobDescription } = req.body;

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
        res.status(500).json({ message: "Something went wrong" })
    }
}

/**
 * @desc Controller to get interview report by interviewId
 */
async function getInterviewReportByIdController(req, res){
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
}

/**
 * @desc Controller to get all interview report by interviewId
 */
async function getAllInterviewReportsController(req, res){
    const interviewReports = await interviewReportModel.find({user: req.user.id}).sort({createdAt: -1}).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}

/**
 * @desc Controller to generate resume PDF (using Puppeteer) based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try{
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

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
        res.status(500).json({ message: "Something went wrong generating the PDF" })
    }  
}

module.exports = {
    generateInterviewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,   
    generateResumePdfController
}

