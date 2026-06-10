import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Briefcase, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  function fillDummy() {
    setEmail('test@recruitassist.in')
    setPassword('Test@1234')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '.5rem' }}>
            <Briefcase size={28} color="var(--brand)" />
            <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--brand)' }}>Career Saathi</span>
          </div>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Your AI-powered recruiting associate for India</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem' }}>Sign in</h2>

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Sign in'}
            </button>
          </form>

          <button onClick={fillDummy} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '.75rem' }}>
            Use test account (Priya Sharma)
          </button>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '13px', color: 'var(--gray-500)' }}>
            No account? <Link to="/signup" style={{ color: 'var(--brand)', fontWeight: '500' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
