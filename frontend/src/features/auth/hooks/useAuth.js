import {useContext} from "react"
import {AuthContext} from "../context/auth.context"
import {login, logout, register} from "../services/auth.api.js"

export const useAuth = () => {

    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading} = context

    //hook: Login user
    const handleLogin  = async ({email, password}) => {
        try{
            setLoading(true)
            const data = await login({email, password})
            if(data){
                setUser(data.user)
                return true
            } 
        }
        catch(err){
            console.error("Login failed", err.response?.data?.message)
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
            const data = await register({username, email, password})
            if(data){
                setUser(data.user)
                return true
            } 
        }
        catch(err){
            console.error("Register failed", err.response?.data?.message)
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

    // useEffect(() => { 

    //     const getAndSetUser = async () => {
    //         try{
    //             const data = await getMe()
    //             setUser(data.user)
    //         }
    //         catch(err){
    //             console.error(err)
    //         }
    //         finally{
    //             setLoading(false)
    //         }
    //     }
    //     getAndSetUser()
    // }, [])

    return {user, loading, handleLogin, handleRegister, handleLogout}
}