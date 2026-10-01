import React, { useState } from 'react';
import "../auth.form.scss"
import { useNavigate, Link, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const Login = () => {

    const { user, loading, handleLogin, authError } = useAuth()
    const navigate = useNavigate();

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [submitting, setSubmitting] = useState(false)   // local, only for the login button

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const success = await handleLogin({ email, password });
        setSubmitting(false);

        if (success) {
            navigate("/");
        }
    }

    // Already logged in (once the background auth check finishes) -> go home
    if (!loading && user) {
        return <Navigate to="/" replace />
    }

    // No full-page loader here: show the form immediately
    return (
        <main className="auth-page">
            <div className="form-container">

                <h1>Login</h1>
                <p className="subtitle">Welcome back! Please login to your account.</p>

                <form onSubmit={handleSubmit}>

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
                        {submitting ? "Logging in..." : "Login"}
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