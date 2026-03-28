import axios from "axios"

//For reusability of code in all below APIs
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true
}) 

//APIs to interact with backend APIs
//API: Register user
export async function register({username, email, password}){
    const response = await api.post("/api/auth/register", {    //reusing
        username, email, password
    })

    return response.data;
}

//API: Login user
export async function login({email, password}){
    const response = await api.post("/api/auth/login", {
            email, password
    })

    return response.data;
}

//API: Logout user
export async function logout(){
    const response = await api.get("/api/auth/logout")

    return response.data;
}

//API: Get(getMe) current user
export async function getMe(){
    const response = await api.get("/api/auth/get-me")

    return response.data;
}