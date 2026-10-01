import React, { useState } from 'react';
import "../auth.form.scss"
import { useNavigate, Link, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const Register = () => {

    const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)   // local, only for the register button

    const { user, loading, handleRegister, authError } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const success = await handleRegister({ username, email, password });
        setSubmitting(false);

        //backend already sets the auth cookie on register, so navigate directly to home instead of forcing a second login
        if (success) {
            navigate("/");
        }
    }

    // Already logged in (once the background auth check finishes) -> go home
    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    // No full-page loader: show the form immediately
    return (
        <main className="auth-page">
            <div className="form-container">

                <h1>Register</h1>
                <p className="subtitle">Create a new account to get started.</p>

                <form onSubmit={handleSubmit}>

                    <div className='inputGroup'>
                        <label htmlFor='username'>Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type='text'
                            id='username'
                            name='username'
                            placeholder='Enter your username'
                            required
                        />
                    </div>

                    <div className='inputGroup'>
                        <label htmlFor='email'>Email</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type='email'
                            id='email'
                            name='email'
                            placeholder='Enter your email'
                            required
                        />
                    </div>

                    <div className='inputGroup'>
                        <label htmlFor='password'>Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Enter your password'
                            required
                        />
                    </div>

                    {authError && <p className="error-msg">{authError}</p>}

                    <button type="submit" className="button primary-button" disabled={submitting}>
                        {submitting ? "Creating account..." : "Register"}
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