import React from 'react';
import { useState } from 'react';
import "../auth.form.scss"
import {useNavigate, Link} from "react-router-dom"
import {useAuth} from "../hooks/useAuth"

const Register = () => {

    const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const {loading, handleRegister, authError} = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const success = await handleRegister({ username, email, password });

        // F5 FIX: backend already sets the auth cookie on register,
        // so navigate directly to home instead of forcing a second login
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

                <h1>Register</h1>
                <p className="subtitle">Create a new account to get started.</p>

                <form onSubmit={handleSubmit}>

                    <div className='inputGroup'>
                        <label htmlFor='username'>Username</label>
                        <input 
                            onChange={(e) => {setUsername(e.target.value)}}
                            type='text' 
                            id='username' 
                            name='username' 
                            placeholder='Enter your username' 
                        />
                    </div>

                    <div className='inputGroup'>
                        <label htmlFor='email'>Email</label>
                        <input 
                            onChange={(e) => {setEmail(e.target.value)}}
                            type='email' 
                            id='email' 
                            name='email' 
                            placeholder='Enter your email' 
                        />
                    </div>

                    <div className='inputGroup'>
                        <label htmlFor='password'>Password</label>
                        <input 
                            onChange={(e) => {setPassword(e.target.value)}}
                            type='password' 
                            id='password' 
                            name='password' 
                            placeholder='Enter your password' 
                        />
                    </div>

                    {authError && <p className="error-msg">{authError}</p>}

                    <button type="submit" className="button primary-button" disabled={loading}>
                        Register
                    </button>

                </form>

                <p className="register-text">
                    Already have an account? <span><Link to={"/login"}>Login</Link></span>
                </p>

            </div>
        </main>
    );
}

export default Register;