import React from 'react';
import { useState } from 'react';
import "../auth.form.scss"
import {useNavigate, Link} from "react-router-dom"
import {useAuth} from "../hooks/useAuth"   

const Login = () => {

    const {loading, handleLogin, authError} = useAuth()

    //to navigate to homepage after login
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const success = await handleLogin({ email, password });

        if(success){
            navigate("/");
        }
    }

    if(loading){
        return (<main>
            <div className="form-container">
                <div className="loader"></div>
            </div>
        </main>)
    }

    return ( 
        <main>
            <div className="form-container">

                <h1>Login</h1>
                <p className="subtitle">Welcome back! Please login to your account.</p>

                <form onSubmit={handleSubmit}>

                    <div className='inputGroup'>
                        <label htmlFor='email'>Email</label>
                        <input 
                            onChange={(e) => { setEmail(e.target.value) }}
                            type='email' 
                            id='email' 
                            name='email' 
                            placeholder='Enter your email' 
                        />
                    </div>

                    <div className='inputGroup'>
                        <label htmlFor='password'>Password</label>
                        <input 
                            onChange={(e) => { setPassword(e.target.value) }}
                            type='password' 
                            id='password' 
                            name='password' 
                            placeholder='Enter your password' 
                        />
                    </div>

                    {authError && <p className="error-msg">{authError}</p>}

                    <button type="submit" className="button primary-button" disabled={loading}>
                        Login
                    </button>

                </form>

                <p className="register-text">
                    Don't have an account? <span><Link to={"/register"}>Register</Link></span>
                </p>

            </div>
        </main>
     );
}

export default Login;