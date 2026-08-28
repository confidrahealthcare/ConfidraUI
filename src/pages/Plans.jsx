import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const plans = [
  {
    name: 'Confidra Core 90',
    amount: 11999,
    original: '₹14,999',
    price: '₹11,999',
    saving: 'Save ₹3,000',
    timing: 'for 90 days · ≈ ₹133 a day',
    features: [
      'Day 0 physician consultation and a personal 90-day plan',
      'Day 90 physician review with your numbers side by side'
    ]
  },
  {
    name: 'Confidra Plus 90',
    amount: 17999,
    original: '₹21,999',
    price: '₹17,999',
    saving: 'Save ₹4,000',
    timing: 'for 90 days · ≈ ₹200 a day',
    features: [
      'Everything in Core',
      'Day 30 and Day 60 physician tele-reviews — four physician touchpoints in all'
    ]
  },
  {
    name: 'Confidra Continuum 365',
    amount: 39999,
    original: '₹49,999',
    price: '₹39,999',
    saving: 'Save ₹10,000',
    timing: 'a year, or ₹10,999 × 4 quarterly · ≈ ₹110 a day',
    features: [
      'The full Plus 90-day intensive, then nine months of continuation',
      'Monthly physician reviews — twelve a year'
    ]
  }
]

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const readResponse = async (response) => {
  const text = await response.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    return {}
  }
}

const loadRazorpay = () => new Promise((resolve, reject) => {
  if (window.Razorpay) {
    resolve()
    return
  }

  const script = document.createElement('script')
  script.src = 'https://checkout.razorpay.com/v1/checkout.js'
  script.onload = () => window.Razorpay ? resolve() : reject(new Error('Payment checkout is unavailable.'))
  script.onerror = () => reject(new Error('Unable to load the payment service. Please try again.'))
  document.body.appendChild(script)
})

const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM']
const doctors = [
  { name: 'Dr. Ananya Mehta', specialty: 'Clinical physician', initials: 'AM' },
  { name: 'Dr. Rohan Kapoor', specialty: 'Chronic care specialist', initials: 'RK' },
  { name: 'Dr. Sara Thomas', specialty: 'Family medicine', initials: 'ST' }
]

export default function Plans() {
  const navigate = useNavigate()
  const [loadingPlan, setLoadingPlan] = useState('')
  const [status, setStatus] = useState({ message: '', error: false })
  const [paidPlan, setPaidPlan] = useState(null)
  const [paymentId, setPaymentId] = useState('')
  const [enrollmentId, setEnrollmentId] = useState(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingStep, setBookingStep] = useState('date')
  const [bookingTime, setBookingTime] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const today = formatDate(new Date())
  const monthLabel = calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate()
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1)

  const startEnrollment = async (plan) => {
    setLoadingPlan(plan.name)
    setStatus({ message: '', error: false })
    try {
      const user = JSON.parse(sessionStorage.getItem('confidraUser') || 'null')
      const response = await fetch('/api/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planName: plan.name, amount: plan.amount, userId: user?.id || null })
      })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.detail || 'Unable to start payment.')
      await loadRazorpay()

      const checkout = new window.Razorpay({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: 'Confidra',
        description: plan.name,
        order_id: result.orderId,
        prefill: { name: user?.fullName || '', email: user?.email || '', contact: user?.phone || '' },
        theme: { color: '#087f72' },
        handler: (paymentResponse) => createEnrollment(plan, paymentResponse.razorpay_payment_id)
      })
      checkout.on('payment.failed', () => setStatus({ message: 'Payment was not completed. Please try again.', error: true }))
      checkout.open()
    } catch (error) {
      setStatus({ message: error.message || 'Unable to connect to the payment service.', error: true })
    } finally {
      setLoadingPlan('')
    }
  }

  const createEnrollment = async (plan, paidPaymentId) => {
    try {
      const user = JSON.parse(sessionStorage.getItem('confidraUser') || 'null')
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || null, planName: plan.name, paymentId: paidPaymentId })
      })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.detail || 'Unable to create the enrollment.')
      setPaidPlan(plan)
      setPaymentId(paidPaymentId)
      setEnrollmentId(result.enrollmentId)
      setBookingStep('date')
      setStatus({ message: `Payment received. Your plan is active until ${new Date(result.expiresUtc).toLocaleDateString('en-IN')}. Select a date to book your doctor consultation.`, error: false })
    } catch (error) {
      setStatus({ message: error.message || 'Payment succeeded, but enrollment could not be created.', error: true })
    }
  }

  const bookDoctor = async (event) => {
    event.preventDefault()
    setBookingLoading(true)
    setStatus({ message: '', error: false })
    try {
      const user = JSON.parse(sessionStorage.getItem('confidraUser') || 'null')
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || null, planName: paidPlan.name, paymentId, appointmentDate: bookingDate, appointmentTime: bookingTime, doctorName: selectedDoctor.name, enrollmentId })
      })
      const result = await readResponse(response)
      if (!response.ok) throw new Error(result.detail || 'Unable to book the consultation.')
      setStatus({ message: result.message, error: false })
      setPaidPlan(null)
      setBookingDate('')
      setBookingTime('')
      setSelectedDoctor(null)
      setEnrollmentId(null)
    } catch (error) {
      setStatus({ message: error.message || 'Unable to book the consultation.', error: true })
    } finally {
      setBookingLoading(false)
    }
  }

  const previewCalendar = (plan) => {
    createEnrollment(plan, `test_payment_preview_${Date.now()}`)
  }

  return (
    <main className="plans-page">
      <div className="plans-container">
        <button className="plans-back" onClick={() => navigate('/dashboard')}>← Back to my care</button>
        <header className="plans-heading">
          <span className="eyebrow">YOUR CARE OPTIONS</span>
          <h1>Programmes</h1>
          <p>Choose the level of coordinated care that feels right for you.</p>
        </header>

        <section className="founding-banner">
          <h2>Founding cohort — the first thirty members</h2>
          <p>Confidra’s first thirty members join at a founding price for the full 90 days, including both diagnostic panels. We are asking the first thirty to help us build the programme properly, and the price reflects that.</p>
        </section>

        <section className="plans-grid" aria-label="Available care programmes">
          {plans.map((plan) => (
            <article className="plan-card" key={plan.name}>
              <h2>{plan.name}</h2>
              <p className="plan-original">{plan.original}</p>
              <p className="plan-price">{plan.price}</p>
              <span className="plan-saving">{plan.saving}</span>
              <p className="plan-timing">{plan.timing}</p>
              <ul>
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <button className="btn primary plan-enroll" onClick={() => startEnrollment(plan)} disabled={loadingPlan !== ''}>{loadingPlan === plan.name ? 'Opening payment...' : 'Start enrollment'}</button>
              {import.meta.env.DEV && <button className="calendar-preview" onClick={() => previewCalendar(plan)}>Preview booking calendar</button>}
            </article>
          ))}
        </section>

        {status.message && <p className={`payment-status ${status.error ? 'error' : 'success'}`}>{status.message}</p>}
        {paidPlan && <section className="booking-panel">
          <span className="eyebrow">BOOK YOUR CONSULTATION</span>
          <div className="booking-title-row"><div><h2>{bookingStep === 'date' ? 'Choose a date' : bookingStep === 'time' ? 'Choose a time' : 'Choose your doctor'}</h2><p>{bookingStep === 'date' ? `Select a convenient date for your ${paidPlan.name} consultation.` : bookingStep === 'time' ? `Available slots for ${new Date(`${bookingDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.` : 'Choose the doctor you would like to meet.'}</p></div><span className="booking-step">{bookingStep === 'date' ? '1 of 3' : bookingStep === 'time' ? '2 of 3' : '3 of 3'}</span></div>
          <form onSubmit={bookDoctor}>
            {bookingStep === 'date' && <div className="calendar-wrap">
              <div className="calendar-header">
                <button type="button" className="calendar-nav" aria-label="Previous month" disabled={calendarMonth <= new Date(new Date().getFullYear(), new Date().getMonth(), 1)} onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>‹</button>
                <strong>{monthLabel}</strong>
                <button type="button" className="calendar-nav" aria-label="Next month" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>›</button>
              </div>
              <div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="calendar-grid">
                {calendarDays.map((day, index) => {
                  const date = day ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day) : null
                  const value = date ? formatDate(date) : ''
                  const disabled = !date || value < today
                  return <button key={`${value}-${index}`} type="button" className={`calendar-day ${value === bookingDate ? 'selected' : ''}`} disabled={disabled} onClick={() => setBookingDate(value)}>{day || ''}</button>
                })}
              </div>
              <div className="calendar-selection">{bookingDate ? `Selected: ${new Date(`${bookingDate}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Select an available date'}</div>
            </div>}
            {bookingStep === 'time' && <div className="slot-grid">{timeSlots.map((slot) => <button type="button" className={`slot-card ${bookingTime === slot ? 'selected' : ''}`} key={slot} onClick={() => setBookingTime(slot)}><span>{slot}</span><small>Available</small></button>)}</div>}
            {bookingStep === 'doctor' && <div className="doctor-grid">{doctors.map((doctor) => <button type="button" className={`doctor-card ${selectedDoctor?.name === doctor.name ? 'selected' : ''}`} key={doctor.name} onClick={() => setSelectedDoctor(doctor)}><span className="doctor-avatar">{doctor.initials}</span><span><strong>{doctor.name}</strong><small>{doctor.specialty}</small></span><span className="doctor-check">✓</span></button>)}</div>}
            <div className="booking-actions">
              {bookingStep !== 'date' && <button type="button" className="booking-back" onClick={() => setBookingStep(bookingStep === 'doctor' ? 'time' : 'date')}>← Back</button>}
              {bookingStep === 'date' && <button type="button" className="btn primary" disabled={!bookingDate} onClick={() => setBookingStep('time')}>Continue to time</button>}
              {bookingStep === 'time' && <button type="button" className="btn primary" disabled={!bookingTime} onClick={() => setBookingStep('doctor')}>Continue to doctor</button>}
              {bookingStep === 'doctor' && <button className="btn primary" type="submit" disabled={bookingLoading || !selectedDoctor}>{bookingLoading ? 'Booking...' : 'Book consultation'}</button>}
            </div>
          </form>
        </section>}
        <p className="plans-note">Your doctor sets the programme right for you at the consultation.</p>
      </div>
    </main>
  )
}
