import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const careTracks = [
  { title: 'Your care plan', detail: 'Review your personalized wellness plan', icon: '01', tone: 'mint' },
  { title: 'Upcoming consultation', detail: 'Connect with your care team', icon: '02', tone: 'amber' },
  { title: 'Health check-in', detail: 'Track how you are feeling today', icon: '03', tone: 'blue' }
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = state?.user || JSON.parse(sessionStorage.getItem('confidraUser') || 'null')
  const name = user?.fullName || 'there'
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  const signOut = () => {
    sessionStorage.removeItem('confidraUser')
    navigate('/auth')
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-topbar">
        <div className="dashboard-container dashboard-nav">
          <div className="dashboard-links">
            <button className="dashboard-link active">My care</button>
            <button className="dashboard-link">Appointments</button>
            <button className="dashboard-link">Resources</button>
          </div>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open profile menu">
              <span className="avatar">{initials}</span>
              <span className="profile-name">{name}</span>
              <span className="chevron" aria-hidden="true" />
            </button>
            {menuOpen && (
              <div className="profile-menu">
                <strong>{name}</strong>
                <span>{user?.email}</span>
                <hr />
                <button>My profile</button>
                <button>Account settings</button>
                <button onClick={signOut}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-container dashboard-content">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">YOUR CONFIDRA SPACE</span>
            <h1>Welcome back, {name.split(' ')[0]}</h1>
            <p>Everything you need for a healthier, more confident you.</p>
          </div>
          <div className="welcome-avatar">{initials}</div>
        </section>

        <section className="dashboard-hero-panel">
          <div>
            <span className="eyebrow">YOUR JOURNEY</span>
            <h2>Small steps. Meaningful change.</h2>
            <p>Your care team is here to help you move forward with clarity and confidence.</p>
            <button className="btn primary" onClick={() => navigate('/plans')}>View my care plan</button>
          </div>
          <div className="journey-mark"><span>CONFIDRA</span><b>01</b></div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div><span className="eyebrow">KEEP MOVING FORWARD</span><h2>Your next steps</h2></div>
            <button className="text-button">View all</button>
          </div>
          <div className="care-grid">
            {careTracks.map((track) => (
              <article className={`care-card ${track.tone}`} key={track.title}>
                <span className="care-number">{track.icon}</span>
                <h3>{track.title}</h3>
                <p>{track.detail}</p>
                <button className="card-link">Open <span>→</span></button>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-section insight-section">
          <div><span className="eyebrow">A MOMENT FOR YOU</span><h2>Wellness, made personal.</h2><p>Explore practical guidance from the Confidra care team, tailored to your everyday life.</p></div>
          <button className="btn secondary">Explore resources</button>
        </section>
      </div>
    </main>
  )
}
