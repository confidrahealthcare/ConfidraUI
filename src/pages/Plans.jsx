import React from 'react'
import { useNavigate } from 'react-router-dom'

const plans = [
  {
    name: 'Confidra Core 90',
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

export default function Plans() {
  const navigate = useNavigate()

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
            </article>
          ))}
        </section>

        <p className="plans-note">Your doctor sets the programme right for you at the consultation.</p>
      </div>
    </main>
  )
}
