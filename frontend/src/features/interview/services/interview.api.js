import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
})

//attach JWT token to every request (if stored in localStorage)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

//Expired sessions caused silent console errors with no UX feedback
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = "/login"
        }
        return Promise.reject(error)
    }
)

//Sending a req to your backend API to generate an interview report
export const generateInterviewReport = async ({jobDescription, selfDescription, resumeFile}) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await api.post("/api/interview", formData,{
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data
}

//Get Single Interview Report by ID
export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`)

    return response.data
}

//Get all Interview Reports
export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/")

    return response.data
}

//generate resume pdf on user's self desc, resume content & job desc
export const generateResumePdf = async({interviewReportId}) => {
    const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
        responseType: "blob"
    })

    return response.data
}