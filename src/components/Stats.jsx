import React from 'react'

const items = [
  {label: 'Patients Onboarded', value: '—'},
  {label: 'Program Follow-up', value: '—'},
  {label: 'Registered Clinicians', value: '—'},
  {label: 'Cities Served', value: '—'},
]

export default function Stats(){
  return (
    <section className="stats container">
      {items.map((it, idx) => (
        <div className="stat" key={idx}>
          <div className="stat-value">{it.value}</div>
          <div className="stat-label">{it.label}</div>
        </div>
      ))}
    </section>
  )
}
