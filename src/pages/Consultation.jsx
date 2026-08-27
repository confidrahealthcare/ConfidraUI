import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Consultation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedPlan = searchParams.get('plan') || ''
  const [form, setForm] = useState({ fullName: '', phone: '', email: '', planName: selectedPlan })
  const [status, setStatus] = useState({ message: '', error: false })
  const [loading, setLoading] = useState(false)

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ message: '', error: false })

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Unable to submit your request.')
      setStatus({ message: result.message, error: false })
      setForm({ fullName: '', phone: '', email: '', planName: selectedPlan })
    } catch (error) {
      setStatus({ message: error.message || 'Unable to connect to the API.', error: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="consultation-page">
      <div className="consultation-container">
        <button className="plans-back" onClick={() => navigate('/')}>← Back to home</button>
        <section className="consultation-card">
          <span className="eyebrow">SPEAK WITH OUR TEAM</span>
          <h1>Talk to a Clinical Pharmacist</h1>
          <p>Share your details and our care team will contact you to arrange a conversation.</p>
          {selectedPlan && <p className="selected-plan">Selected programme: <strong>{selectedPlan}</strong></p>}
          {status.message && <p className={`form-status ${status.error ? 'error' : 'success'}`}>{status.message}</p>}
          <form onSubmit={submit}>
            <label htmlFor="consultation-full-name">Full name</label>
            <input id="consultation-full-name" name="fullName" value={form.fullName} onChange={updateField} required maxLength="150" autoComplete="name" />
            <label htmlFor="consultation-phone">Phone</label>
            <input id="consultation-phone" name="phone" value={form.phone} onChange={updateField} required maxLength="30" type="tel" autoComplete="tel" />
            <label htmlFor="consultation-email">Email</label>
            <input id="consultation-email" name="email" value={form.email} onChange={updateField} required maxLength="320" type="email" autoComplete="email" />
            <button className="btn primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Request a conversation'}</button>
          </form>
        </section>
      </div>
    </main>
  )
}
