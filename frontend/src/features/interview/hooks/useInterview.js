import {getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf} from "../services/interview.api"
import {useContext, useEffect, useState} from "react"
import {InterviewContext} from "../interview.context"
import {useParams} from "react-router-dom"


export const useInterview = () => {
    const context = useContext(InterviewContext)
    const {interviewId} = useParams()

    if(!context){
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const {loading, setLoading, report, setReport, reports, setReports} = context

    const [pdfLoading, setPdfLoading] = useState(false) 

    const generateReport = async ({jobDescription, selfDescription, resumeFile}) => {
        setLoading(true)
        try{
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setReport(response.interviewReport)
            return response.interviewReport
        } catch(err){
            if (err.response?.status === 429) {
                alert("AI quota exceeded. Please try again tomorrow.")
            } else {
                alert("Something went wrong generating the PDF. Please try again.")
            }
            console.error(err)
        } finally{
            setLoading(false)
        }
    }

    const getReportById = async (interviewId) => {
        setLoading(true)
        try{
            const response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
            return response.interviewReport
        } catch(err){
            console.error(err)
        } finally{
            setLoading(false)
        }
    }

    const getReports = async () => {
        setLoading(true)
        try{
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
            return response.interviewReports
        } catch(err){
            console.error(err)
        } finally{
            setLoading(false)
        }
    }

    // const getResumePdf = async({interviewReportId}) => {
    //     setPdfLoading(true)
    //     try{
    //         const response = await generateResumePdf({ interviewReportId })
    //         const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
    //         const link = document.createElement("a")
    //         link.href = url
    //         link.setAttribute("download", `resume_${interviewReportId}.pdf`)
    //         document.body.appendChild(link)
    //         link.click()
    //         document.body.removeChild(link)
    //         window.URL.revokeObjectURL(url)
    //     } catch(err){
    //         console.error(err)
    //     } finally{
    //         setPdfLoading(false)
    //     }
    // }

    const getResumePdf = async ({ interviewReportId }) => {
        setPdfLoading(true)
        try {
            const blob = await generateResumePdf({ interviewReportId })  // already a Blob

            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch(err) {
            if (err.response?.status === 429) {
                alert("AI quota exceeded. Please try again tomorrow.")
            } else {
                alert("Something went wrong generating the PDF. Please try again.")
            }
            console.error(err)
        } finally {
            setPdfLoading(false)
        }
    }

    useEffect(() => {
        if(interviewId){
            getReportById(interviewId)
        } else{
            getReports()
        }
    }, [interviewId])

    return { loading, pdfLoading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
