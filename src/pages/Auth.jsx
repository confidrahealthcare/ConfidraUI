import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE_URL = ''

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', emailOrPhone: '' })
  const [status, setStatus] = useState({ message: '', error: false })
  const [loading, setLoading] = useState(false)
  const [resetStep, setResetStep] = useState('email')
  const [resetOtp, setResetOtp] = useState('')

  const updateField = (event) => setForm({ ...form, [event.target.name]: event.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus({ message: '', error: false })
    let endpoint
    let payload
    if (mode === 'forgot') {
      endpoint = resetStep === 'email' ? '/api/auth/password-reset/request'
        : resetStep === 'otp' ? '/api/auth/password-reset/verify' : '/api/auth/password-reset/complete'
      payload = resetStep === 'email' ? { email: form.email }
        : resetStep === 'otp' ? { email: form.email, otp: resetOtp }
        : { email: form.email, otp: resetOtp, newPassword: form.password }
    } else {
      endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      payload = mode === 'login'
        ? { emailOrPhone: form.emailOrPhone, password: form.password }
        : { fullName: form.fullName, email: form.email, phone: form.phone, password: form.password }
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Request failed.')
      if (mode === 'forgot') {
        if (resetStep === 'email') {
          setResetStep('otp')
          setStatus({ message: 'Check your email for the six-digit verification code.', error: false })
        } else if (resetStep === 'otp') {
          setResetStep('password')
          setStatus({ message: 'Code verified. Create your new password.', error: false })
        } else {
          setMode('login')
          setResetStep('email')
          setResetOtp('')
          setForm({ ...form, password: '' })
          setStatus({ message: 'Password updated successfully. You can now log in.', error: false })
        }
      } else if (mode === 'login') {
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
          <button className={mode === 'login' ? 'btn primary' : 'btn secondary'} onClick={() => { setMode('login'); setStatus({ message: '', error: false }) }}>Login</button>
          <button className={mode === 'register' ? 'btn primary' : 'btn secondary'} onClick={() => { setMode('register'); setStatus({ message: '', error: false }) }}>Register</button>
        </div>
        <form onSubmit={submit}>
          {mode === 'forgot' ? <div>
            <h2>Reset your password</h2>
            {resetStep === 'email' && <><p>Enter your email and we will send you a verification code.</p><label htmlFor="resetEmail">Email</label><input id="resetEmail" name="email" value={form.email} onChange={updateField} required type="email" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></>}
            {resetStep === 'otp' && <><p>Enter the six-digit code sent to {form.email}.</p><label htmlFor="resetOtp">Verification code</label><input id="resetOtp" value={resetOtp} onChange={(event) => setResetOtp(event.target.value)} required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></>}
            {resetStep === 'password' && <><p>Choose a new password for your account.</p><label htmlFor="newPassword">New password</label><input id="newPassword" name="password" value={form.password} onChange={updateField} required minLength="8" type="password" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></>}
          </div> : mode === 'login' ? <div><h2>Login</h2><p>Enter your credentials to continue.</p><label htmlFor="emailOrPhone">Email or Phone</label><input id="emailOrPhone" name="emailOrPhone" value={form.emailOrPhone} onChange={updateField} required type="text" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></div> : <div><h2>Register</h2><p>Create your Confidra account.</p><label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" value={form.fullName} onChange={updateField} required type="text" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /><label htmlFor="email">Email</label><input id="email" name="email" value={form.email} onChange={updateField} required type="email" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /><label htmlFor="phone">Phone</label><input id="phone" name="phone" value={form.phone} onChange={updateField} required type="tel" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></div>}
          {mode !== 'forgot' ? <><label htmlFor="password">Password</label><input id="password" name="password" value={form.password} onChange={updateField} required type="password" style={{ width: '100%', padding: 8, marginTop: 6, marginBottom: 12 }} /></> : null}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><button className="btn primary" type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'forgot' ? resetStep === 'email' ? 'Send code' : resetStep === 'otp' ? 'Verify code' : 'Update password' : mode === 'login' ? 'Login' : 'Create account'}</button>{mode === 'login' && <button type="button" className="text-button" onClick={() => { setMode('forgot'); setResetStep('email'); setStatus({ message: '', error: false }) }}>Forgot password?</button>}{mode === 'forgot' && <button type="button" className="text-button" onClick={() => { setMode('login'); setStatus({ message: '', error: false }) }}>Back to login</button>}</div>
          {status.message && <p style={{ color: status.error ? '#b42318' : '#0B4F44', marginTop: 16 }}>{status.message}</p>}
        </form>
      </div>
    </div>
  )
}