import React, { useEffect, useState } from 'react'
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
  const [activeTab, setActiveTab] = useState('care')
  const [appointments, setAppointments] = useState([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [appointmentsError, setAppointmentsError] = useState('')
  const [cancellationId, setCancellationId] = useState(null)
  const user = state?.user || JSON.parse(sessionStorage.getItem('confidraUser') || 'null')
  const name = user?.fullName || 'there'
  const initials = name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()

  useEffect(() => {
    if (activeTab !== 'appointments' || !user?.id) return
    setAppointmentsLoading(true)
    setAppointmentsError('')
    fetch(`/api/appointments?userId=${user.id}`)
      .then(async (response) => {
        const responseText = await response.text()
        let result = []
        try {
          result = responseText ? JSON.parse(responseText) : []
        } catch {
          throw new Error('Unable to load appointments. Please try again.')
        }
        if (!response.ok) throw new Error(result.detail || 'Unable to load appointments.')
        return result
      })
      .then(setAppointments)
      .catch((error) => setAppointmentsError(error.message))
      .finally(() => setAppointmentsLoading(false))
  }, [activeTab, user?.id])

  const cancelAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel?userId=${user.id}`, { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Unable to cancel appointment.')
      setAppointments((current) => current.map((appointment) => appointment.id === appointmentId ? { ...appointment, status: 'Cancelled' } : appointment))
    } catch (error) {
      setAppointmentsError(error.message)
    } finally {
      setCancellationId(null)
    }
  }

  const signOut = () => {
    sessionStorage.removeItem('confidraUser')
    navigate('/auth')
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard-topbar">
        <div className="dashboard-container dashboard-nav">
          <div className="dashboard-links">
            <button className={`dashboard-link ${activeTab === 'care' ? 'active' : ''}`} onClick={() => setActiveTab('care')}>My care</button>
            <button className={`dashboard-link ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>Appointments</button>
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
        {activeTab === 'appointments' ? <section className="appointments-view">
          <button className="booking-back" onClick={() => setActiveTab('care')}>← Back to my care</button>
          <span className="eyebrow">YOUR APPOINTMENTS</span>
          <h1>Appointments</h1>
          <p className="appointments-intro">Your upcoming consultations in one place.</p>
          {appointmentsLoading && <p className="appointments-message">Loading your appointments...</p>}
          {appointmentsError && <p className="appointments-message error">{appointmentsError}</p>}
          {!appointmentsLoading && !appointmentsError && appointments.length === 0 && <div className="appointments-empty"><h2>No appointments booked yet</h2><p>Choose a care programme to book your first doctor consultation.</p><button className="btn primary" onClick={() => navigate('/plans')}>View care programmes</button></div>}
          <div className="appointments-list">
            {appointments.map((appointment) => <article className={`appointment-card ${appointment.status === 'Cancelled' ? 'cancelled' : ''}`} key={appointment.id}><div className="appointment-date"><strong>{new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong><span>{new Date(appointment.appointmentDate).toLocaleDateString('en-IN', { weekday: 'long' })}</span></div><div><span className="eyebrow">{appointment.planName}</span><h2>{appointment.doctorName}</h2><p>{appointment.appointmentTime}</p></div><div className="appointment-actions"><span className="appointment-status">{appointment.status || 'Confirmed'}</span>{appointment.status !== 'Cancelled' && <button className="cancel-appointment" onClick={() => setCancellationId(appointment.id)}>Cancel</button>}</div></article>)}
          </div>
        </section> : <>
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
        </>}
      </div>
      {cancellationId !== null && <div className="modal-backdrop" role="presentation" onClick={() => setCancellationId(null)}><section className="cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-title" onClick={(event) => event.stopPropagation()}><h2 id="cancel-title">Cancel this appointment?</h2><p>This appointment will be marked as cancelled.</p><div className="modal-actions"><button className="booking-back" onClick={() => setCancellationId(null)}>Keep appointment</button><button className="cancel-confirm" onClick={() => cancelAppointment(cancellationId)}>Cancel appointment</button></div></section></div>}
    </main>
  )
}
