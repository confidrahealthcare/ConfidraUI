import React from 'react'

const clinicians = [
  {
    name: 'Dr. Karthik A',
    credentials: 'MBBS, MD (General Medicine) — M.S. Ramaiah Medical College',
    role: 'Consultant Physician & Diabetologist',
    details: 'KMC Reg. No. 86786 · Medical Director & Physician Co-Founder, Confidra'
  },
  {
    name: 'Dr. Tarun Dilip Javali',
    credentials: 'MBBS (JIPMER), MS — General Surgery (JIPMER), MCh — Urology (AIIMS New Delhi)',
    role: 'Consultant Urologist & Andrologist',
    details: "KMC Reg. No. 93684 · Clinical Advisor — Urology & Men's Health, Confidra"
  }
]

export default function HowToStart() {
  return (
    <section className="how-to-start container">
      <div className="how-to-header">
        <span className="eyebrow">YOUR FIRST STEP</span>
        <h2>How to start</h2>
        <div className="contact-line">confidra.health · care@confidra.health</div>
      </div>
      <div className="start-details">
        <div className="start-badge" aria-hidden="true">01</div>
        <div>
          <p><strong>₹999 reserves your place and your Day 0 consultation.</strong> Fully refundable and credited in full against your programme fee.</p>
          <p><strong>Seven-day cooling-off.</strong> Cancel within 7 days of payment and before your Day 0 consultation for a 100% refund.</p>
          <p><strong>Doctor-fit gate.</strong> If the Day 0 doctor advises the programme is not right for you, you receive a full refund.</p>
          <p><strong>One pause</strong> of up to 30 days per programme.</p>
        </div>
      </div>
      <div className="clinician-heading">
        <span className="eyebrow">CLINICAL LEADERSHIP</span>
        <h2>Accountable people, named</h2>
      </div>
      <div className="clinician-list">
        {clinicians.map((clinician) => <article className="clinician-card" key={clinician.name}>
          <h3>{clinician.name} <span>{clinician.credentials}</span></h3>
          <p><strong>{clinician.role}</strong> · {clinician.details}</p>
        </article>)}
      </div>
      <div className="referral-fields" aria-label="Referral information">
        <span>Referred by Dr. <i /></span>
        <span>Clinic <i /></span>
        <span>Date <i /></span>
        <span>Ref. CFD- <i /></span>
      </div>
    </section>
  )
}
