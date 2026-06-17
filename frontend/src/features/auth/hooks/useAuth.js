import {useContext, useState} from "react"
import {AuthContext} from "../context/auth.context"
import {login, logout, register} from "../services/auth.api.js"

export const useAuth = () => {

    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context

    const [authError, setAuthError] = useState(null)

    //hook: Login user
    const handleLogin  = async ({email, password}) => {
        try{
            setLoading(true)
            setAuthError(null)
            const data = await login({email, password})
            if(data){
                setUser(data.user)
                return true
            } 
        }
        catch(err){
            const msg = err.response?.data?.message || "Login failed. Please try again."
            setAuthError(msg)
            return false
        }
        finally{
            setLoading(false)
        }
    }

    //hook: Register user
    const handleRegister = async({username, email, password}) => {
        try{
            setLoading(true)
            setAuthError(null)
            const data = await register({username, email, password})
            if(data){
                setUser(data.user)
                return true
            } 
        }
        catch(err){
            const msg = err.response?.data?.message || "Registration failed. Please try again."
            setAuthError(msg)
            return false
        }
        finally{
            setLoading(false)
        }
    }

    //hook: Logout user
    const handleLogout = async () => {
        try{
            setLoading(true)
            await logout()
            setUser(null)
        }
        catch(err){
            console.error("Logout failed", err)
        }
        finally{
            setLoading(false)
        }
    }

    return {user, loading, authError, handleLogin, handleRegister, handleLogout}
}