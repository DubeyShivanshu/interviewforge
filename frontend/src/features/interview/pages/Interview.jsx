import React, { useState, useEffect } from 'react';
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js"
import { useParams } from "react-router-dom"
// Nav items 
const NAV_ITEMS = [
  { id: 'technical',  label: 'Technical questions' },
  { id: 'behavioral', label: 'Behavioral questions' },
  { id: 'roadmap',    label: 'Road Map' },
];

// Question card
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`question-card ${open ? 'question-card--open' : ''}`}>
      <button className="question-card__header" onClick={() => setOpen(o => !o)}>
        <span className="question-card__index">Q{index + 1}</span>
        <p className="question-card__question">{item.question}</p>
        <span className="question-card__chevron">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="question-card__body">
          <div className="question-card__section">
            <span className="question-card__label">Intention</span>
            <p className="question-card__text">{item.intention}</p>
          </div>
          <div className="question-card__section">
            <span className="question-card__label">Model Answer</span>
            <p className="question-card__text">{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Road map day card
const DayCard = ({ item }) => (
  <div className="day-card">
    <div className="day-card__badge">Day {item.day}</div>
    <div className="day-card__content">
      <p className="day-card__focus">{item.focus}</p>
      <ul className="day-card__tasks">
        {item.tasks.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  </div>
);

// Main component
const Interview = () => {
  const [active, setActive] = useState('technical');
  const { report, getReportById, loading, pdfLoading, getResumePdf } = useInterview();  
  const { interviewId } = useParams()

  useEffect(() => {
    if(interviewId){
      getReportById(interviewId)
    }
  }, [interviewId])

  // Loading / null guard — prevents crash before report arrives
  if (loading || !report) {
    return (
      <div className="interview interview--loading">
        <div className="loading-state">
          <span className="loading-state__dot" />
          <span className="loading-state__dot" />
          <span className="loading-state__dot" />
          <p>Loading your interview plan...</p>
        </div>
      </div>
    );
  }

  // scoreColor — drives ring colour class
  const scoreColor =
    report.matchScore >= 80 ? 'score--high' :
    report.matchScore >= 60 ? 'score--mid'  : 'score--low';

  const renderContent = () => {
    if (active === 'technical') {
      return (
        <section className="content-section" key="technical">
          <header className="content-section__header">
            <span className="content-section__pill">Technical</span>
            <h2 className="content-section__title">Technical Questions</h2>
            <p className="content-section__sub">
              {report.technicalQuestions.length} questions tailored to your target role  {/* ✅ data → report */}
            </p>
          </header>
          <div className="content-section__list">
            {report.technicalQuestions.map((q, i) => (  /* ✅ data → report */
              <QuestionCard key={i} item={q} index={i} />
            ))}
          </div>
        </section>
      );
    }

    if (active === 'behavioral') {
      return (
        <section className="content-section" key="behavioral">
          <header className="content-section__header">
            <span className="content-section__pill">Behavioral</span>
            <h2 className="content-section__title">Behavioral Questions</h2>
            <p className="content-section__sub">
              {report.behavioralQuestions.length} questions to showcase your soft skills  {/* ✅ data → report */}
            </p>
          </header>
          <div className="content-section__list">
            {report.behavioralQuestions.map((q, i) => (  /* ✅ data → report */
              <QuestionCard key={i} item={q} index={i} />
            ))}
          </div>
        </section>
      );
    }

    if (active === 'roadmap') {
      return (
        <section className="content-section" key="roadmap">
          <header className="content-section__header">
            <span className="content-section__pill">Plan</span>
            <h2 className="content-section__title">Preparation Road Map</h2>
            <p className="content-section__sub">
              {report.preparationPlan.length}-day structured plan to close your skill gaps  {/* ✅ data → report */}
            </p>
          </header>
          <div className="content-section__list">
            {report.preparationPlan.map((d, i) => (  /* ✅ data → report */
              <DayCard key={i} item={d} />
            ))}
          </div>
        </section>
      );
    }
  };

  return (
    <div className="interview">

      {/* ── Left sidebar ── */}
      <aside className="iv-sidebar">

        {/* Match score ring */}
        <div className="iv-sidebar__score">
          <span className="iv-sidebar__score-label">Match Score</span>
          <div className={`iv-sidebar__score-ring ${scoreColor}`}>  {/* scoreColor class */}
            <svg viewBox="0 0 64 64" className="iv-sidebar__score-svg">
              <circle cx="32" cy="32" r="27" className="iv-sidebar__score-track" />
              <circle
                cx="32" cy="32" r="27"
                className="iv-sidebar__score-fill"
                strokeDasharray={`${(report.matchScore / 100) * 169.6} 169.6`}  /* data → report */
                strokeDashoffset="42.4"
              />
            </svg>
            <span className="iv-sidebar__score-value">{report.matchScore}</span>  {/* data → report */}
          </div>
          <p className="iv-sidebar__score-sub">
            {report.matchScore >= 80 ? 'Strong match for this role'  :
             report.matchScore >= 60 ? 'Moderate — keep preparing'   : 'Low match — significant gaps'}
          </p>
        </div>

        {/* Nav */}
        <nav className="iv-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`iv-nav__item ${active === item.id ? 'iv-nav__item--active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="iv-nav__dot" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Download Resume button */}
        <button
          className="button primary-button"
          onClick={() => getResumePdf({ interviewReportId: interviewId })}
          disabled={pdfLoading}
        >
          <svg height="0.8rem" style={{ marginRight: "0.8rem" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"/>
          </svg>
          {pdfLoading ? 'Generating PDF...' : 'Download Resume'}
        </button>
      </aside>

      {/* ── Center content ── */}
      <main className="iv-main">
        {renderContent()}
      </main>

      {/* ── Right sidebar ── */}
      <aside className="iv-right">
        <div className="iv-gaps">
          <h3 className="iv-gaps__title">Skill Gaps</h3>
          <div className="iv-gaps__tags">
            {report.skillGaps.map((g, i) => (  /* data → report */
              <span
                key={i}
                className={`iv-gaps__tag iv-gaps__tag--${g.severity}`}
              >
                {g.skill}
              </span>
            ))}
          </div>
        </div>
      </aside>

    </div>
  );
};

export default Interview;