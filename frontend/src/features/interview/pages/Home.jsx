import React from 'react';
import {useState, useRef} from "react"
import "../style/home.scss";
import {useInterview} from "../hooks/useInterview.js"
import {useNavigate} from "react-router-dom"

const Home = () => {

    const { loading, generateReport, reports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")

    const resumeInputRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async() => {
        const resumeFile = resumeInputRef.current.files[0]
        const data = await generateReport({jobDescription, selfDescription, resumeFile})
        //navigate(`/interview/${data._id}`)

        if (data?._id) {                          // guard against undefined
            navigate(`/interview/${data._id}`)
        }
    }

    if(loading){
        return(
            <main className='loading-screen'>
                <div className='dots'>
                    <h1>Generating your interview plan</h1>
                </div>
        </main>
        )
    }

    return ( 
        <main className='home'>

            {/* Page Header */}
            <header className="page-header">
                <h1 className="page-title">
                    Create Your Custom{' '}
                    <span className="accent">Interview Plan</span>
                </h1>
                <p className="page-subtitle">
                    Let our AI analyze the job requirements and your unique profile to build a
                    winning strategy.
                </p>
            </header>
            
            <div className="interview-input-group">

                {/* Job Description */}
                <div className="left">
                    <label htmlFor='jobDescription'>Target Job Description</label>
                    <textarea 
                        onChange={(e)=>{setJobDescription(e.target.value)}}
                        name='jobDescription' 
                        id='jobDescription' 
                        placeholder={`Paste the full job description here...
e.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                    />
                </div>

                {/* Resume + Self Description */}
                <div className="right">
                    <div className="input-group">
                        <label htmlFor='resume'>Upload Resume</label>
                        <input 
                            ref={resumeInputRef}
                            type='file' 
                            name='resume' 
                            id='resume' 
                            accept='.pdf'
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor='selfDescription'>Quick Self-Description</label>
                        <textarea 
                            onChange={(e)=>{setSelfDescription(e.target.value)}}
                            name='selfDescription' 
                            id='selfDescription' 
                            placeholder='Briefly describe your experience, key skills, and years of experience if you don’t have a resume handy...'
                        />
                    </div>

                    <button className='generate-btn' onClick={handleGenerateReport}>
                        Generate Interview Report
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li key={report._id} className='report-item' onClick={() => navigate(`/interview/${report._id}`)}>
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )} 
        </main>
    );
};

export default Home;