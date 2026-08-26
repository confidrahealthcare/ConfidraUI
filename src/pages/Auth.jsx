import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = 'https://localhost:7025'

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', emailOrPhone: '' })
  const [status, setStatus] = useState({ message: '', error: false })
  const [loading, setLoading] = useState(false)

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ message: '', error: false })
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const payload = mode === 'login'
      ? { emailOrPhone: form.emailOrPhone, password: form.password }
      : { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Request failed.')
      if (mode === 'login') {
        sessionStorage.setItem('confidraUser', JSON.stringify(result))
        navigate('/dashboard', { state: { user: result } })
      } else {
        setStatus({ message: 'Account created successfully. You can now log in.', error: false })
        setMode('login')
      }
    } catch (error) {
      setStatus({ message: error.message || 'Unable to connect to the API.', error: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 8, border: '1px solid #eef2f1' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className={mode === 'login' ? 'btn primary' : 'btn secondary'} onClick={() => setMode('login')}>Login</button>
          <button className={mode === 'register' ? 'btn primary' : 'btn secondary'} onClick={() => setMode('register')}>Register</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'login' ? <div><h2>Login</h2><p>Enter your credentials to continue.</p><label htmlFor="emailOrPhone">Email or Phone</label><input id="emailOrPhone" name="emailOrPhone" value={form.emailOrPhone} onChange={updateField} required type="text" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></div> : <div><h2>Register</h2><p>Create your Confidra account.</p><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" value={form.fullName} onChange={updateField} required type="text" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /><label htmlFor="email">Email</label><input id="email" name="email" value={form.email} onChange={updateField} required type="email" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /><label htmlFor="phone">Phone</label><input id="phone" name="phone" value={form.phone} onChange={updateField} required type="tel" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></div>}
          <label htmlFor="password">Password</label><input id="password" name="password" value={form.password} onChange={updateField} required type="password" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><button className="btn primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>{mode === 'login' && <a href="#">Forgot password?</a>}</div>
          {status.message && <p style={{ color: status.error ? '#b42318' : '#0B4F44', marginTop: 16 }}>{status.message}</p>}
        </form>
      </div>
    </div>
  )
}