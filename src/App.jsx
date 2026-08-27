import React from 'react'
import SiteHeader from './components/SiteHeader'
import Hero from './components/Hero'
import Stats from './components/Stats'
import Benefits from './components/Benefits'
import Footer from './components/Footer'
import { Routes, Route } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Plans from './pages/Plans'

export default function App() {
  return (
    <div className="app">
      <SiteHeader />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/" element={<>
          <Hero />
          <main className="container">
            <Stats />
            <Benefits />
            <section className="company-story">
              <h2>Company Story</h2>
              <p>Confidra was built to close the gap in fragmented chronic care. We bring physicians, clinical pharmacists, diagnostics, nutrition experts, and wellness coaches onto one connected platform.</p>
            </section>
          </main>
          <Footer />
        </>} />
      </Routes>
    </div>
  )
}