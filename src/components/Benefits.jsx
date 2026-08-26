import React from 'react'

const benefits = [
  'One dedicated Clinical Pharmacist',
  'Diagnostics done at home',
  'Coordinated specialist consultations',
  'Personalized medication management',
  'Nutrition and lifestyle coaching',
  'Continuous Day 1 / 30 / 60 / 90 follow-up',
]

export default function Benefits(){
  return (
    <section className="benefits container">
      <h2>Patient Benefits</h2>
      <ul className="benefit-list">
        {benefits.map((b, i) => (
          <li key={i} className="benefit-item">🔹 {b}</li>
        ))}
      </ul>
    </section>
  )
}
