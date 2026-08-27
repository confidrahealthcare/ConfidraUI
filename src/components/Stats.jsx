import React, { useEffect, useState } from 'react'

const items = [
  {label: 'Patients Onboarded', key: 'patientsOnboarded', icon: '✚'},
  {label: 'Program Follow-up', key: 'programFollowUp', icon: '↗'},
  {label: 'Registered Clinicians', key: 'registeredClinicians', icon: '✦'},
  {label: 'Cities Served', key: 'citiesServed', icon: '⌖'},
]

export default function Stats(){
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch('/api/stats')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Stats request failed')))
      .then(setStats)
      .catch(() => setStats(null))
  }, [])

  return (
    <section className="stats container">
      {items.map((it, idx) => (
        <div className="stat" key={idx}>
          <div className="stat-icon" aria-hidden="true">{it.icon}</div>
          <div className="stat-value">{stats ? stats[it.key].toLocaleString() : '—'}</div>
          <div className="stat-label">{it.label}</div>
        </div>
      ))}
    </section>
  )
}
