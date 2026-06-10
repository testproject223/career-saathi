import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Briefcase } from 'lucide-react'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUp(form.email, form.password, form.name)
    if (error) { setError(error.message); setLoading(false) }
    else { setSuccess(true); setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '.5rem' }}>Account created!</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '1.5rem' }}>Check your email to confirm, then sign in to complete your profile.</p>
        <Link to="/login" className="btn btn-primary" style={{ justifyContent: 'center' }}>Go to sign in</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '.5rem' }}>
            <Briefcase size={28} color="var(--brand)" />
            <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand)' }}>Career Saathi</span>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Create your free account</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem' }}>Sign up</h2>
          {error && <div style={{ padding: '10px 12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>
              <input value={form.name} onChange={set('name')} placeholder="Priya Sharma" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Create account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '13px', color: 'var(--gray-500)' }}>
            Have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: '500' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
