import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Phone, Mail } from 'lucide-react'

function mobileToEmail(mobile) {
  const digits = mobile.replace(/\D/g, '')
  const normalized = digits.startsWith('91') && digits.length === 12 ? digits : '91' + digits.slice(-10)
  return `${normalized}@careersaathi.app`
}

function isValidMobile(val) {
  return /^[6-9]\d{9}$/.test(val.replace(/\D/g, '').slice(-10))
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('mobile') // mobile | email
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')

    const loginEmail = mode === 'mobile' ? mobileToEmail(mobile) : email

    if (mode === 'mobile' && !isValidMobile(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number')
      setLoading(false); return
    }

    const { error: err } = await signIn(loginEmail, password)
    if (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Mobile number or password is incorrect. Please try again.'
        : err.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>💼</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--brand)' }}>Career Saathi</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Your AI-powered recruiting associate for India</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem' }}>Sign in</h2>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: '3px', marginBottom: '1.25rem' }}>
            {[['mobile','📱 Mobile'],['email','✉️ Email']].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{ flex: 1, padding: '7px', border: 'none', borderRadius: 'calc(var(--radius-md) - 2px)', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all .15s',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? 'var(--brand)' : 'var(--gray-500)',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '1rem', lineHeight: '1.5' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'mobile' ? (
              <div className="form-group">
                <label>Mobile number</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--gray-500)', pointerEvents: 'none' }}>
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="98765 43210"
                    required
                    style={{ paddingLeft: '60px', letterSpacing: '1px' }}
                  />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>Enter the 10-digit number you registered with</p>
              </div>
            ) : (
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
            )}

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
              {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Sign in'}
            </button>
          </form>

          {/* Test accounts */}
          <div style={{ marginTop: '1rem', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--gray-500)' }}>
            <p style={{ fontWeight: '500', marginBottom: '5px', color: 'var(--gray-600)' }}>Test accounts:</p>
            <button onClick={() => { setMode('email'); setEmail('harsh@try.com'); setPassword('harsh123') }}
              style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '12px', padding: '2px 0', textAlign: 'left' }}>
              Harsh (Senior PM, 8–12 yrs) →
            </button>
            <button onClick={() => { setMode('email'); setEmail('test@recruitassist.in'); setPassword('Test@1234') }}
              style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', fontSize: '12px', padding: '2px 0', textAlign: 'left' }}>
              Priya (Fresher, Data Analyst) →
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '13px', color: 'var(--gray-500)' }}>
            No account? <Link to="/signup" style={{ color: 'var(--brand)', fontWeight: '500' }}>Register free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
