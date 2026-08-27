import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Hero() {
  const navigate = useNavigate()
  return (
    <header className="hero">
      <div className="hero-inner container">
        <div className="hero-copy">
          <h1>Your Chronic Health, Finally Coordinated.</h1>
          <p className="lead">Confidra brings specialist doctors, a dedicated clinical pharmacist, home diagnostics, and continuous coaching together in one connected platform.</p>
          <div className="hero-ctas">
            <button className="btn primary" onClick={() => navigate('/auth')}>Start Your Care Journey</button>
            <button className="btn secondary" onClick={() => navigate('/consultation')}>Talk to a Clinical Pharmacist</button>
            <a className="tertiary-link" href="#programs">Explore Our Programs</a>
          </div>
        </div>
        <div className="hero-visual" aria-hidden>
          <div className="hub-spoke">
            <div className="center">You</div>
            <div className="node">Doctor</div>
            <div className="node">Pharmacist</div>
            <div className="node">Diagnostics</div>
            <div className="node">Nutrition</div>
          </div>
        </div>
      </div>
    </header>
  )
}
