import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'

function mobileToEmail(mobile) {
  const digits = mobile.replace(/\D/g, '')
  const normalized = digits.startsWith('91') && digits.length === 12 ? digits : '91' + digits.slice(-10)
  return `${normalized}@careersaathi.app`
}

function isValidMobile(val) {
  return /^[6-9]\d{9}$/.test(val.replace(/\D/g, '').slice(-10))
}

const PASSWORD_RULES = [
  { label: 'At least 6 characters', test: v => v.length >= 6 },
  { label: 'At least one number', test: v => /\d/.test(v) },
]

export default function Signup() {
  const { signUp, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('mobile')
  const [form, setForm] = useState({ name:'', mobile:'', email:'', password:'', confirmPassword:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setMobileDigits = e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g,'').slice(0,10) }))

  const pwRules = PASSWORD_RULES.map(r => ({ ...r, passed: r.test(form.password) }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) { setError('Please enter your name'); return }

    if (mode === 'mobile') {
      if (!isValidMobile(form.mobile)) { setError('Enter a valid 10-digit Indian mobile number'); return }
    }

    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }

    setLoading(true)

    const loginEmail = mode === 'mobile' ? mobileToEmail(form.mobile) : form.email
    const { data, error: signUpErr } = await signUp(loginEmail, form.password, form.name)

    if (signUpErr) {
      if (signUpErr.message.includes('already registered') || signUpErr.message.includes('already been registered')) {
        setError(mode === 'mobile'
          ? 'This mobile number is already registered. Please sign in instead.'
          : 'This email is already registered. Please sign in instead.')
      } else {
        setError(signUpErr.message)
      }
      setLoading(false); return
    }

    // Save mobile in profile
    if (mode === 'mobile' && data?.user) {
      await updateProfile({ mobile: form.mobile, display_name: form.name })
    }

    navigate('/onboarding')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>💼</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--brand)' }}>Career Saathi</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '4px' }}>Create your free account</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem' }}>Register</h2>

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
              {error.includes('already registered') && (
                <span> <Link to="/login" style={{ color: 'var(--danger)', fontWeight: '600', textDecoration: 'underline' }}>Sign in →</Link></span>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name *</label>
              <input value={form.name} onChange={set('name')} placeholder="Priya Sharma" required />
            </div>

            {mode === 'mobile' ? (
              <div className="form-group">
                <label>Mobile number *</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: 'var(--gray-500)', pointerEvents: 'none' }}>
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={setMobileDigits}
                    placeholder="98765 43210"
                    required
                    style={{ paddingLeft: '60px', letterSpacing: '1px' }}
                  />
                </div>
                {form.mobile.length === 10 && (
                  <p style={{ fontSize: '11px', color: isValidMobile(form.mobile) ? 'var(--success)' : 'var(--danger)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    {isValidMobile(form.mobile) ? <><CheckCircle size={11} /> Valid Indian mobile number</> : '⚠ Must start with 6, 7, 8 or 9'}
                  </p>
                )}
              </div>
            ) : (
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
              </div>
            )}

            <div className="form-group">
              <label>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 6 characters"
                  required
                  style={{ paddingRight: '40px' }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {pwRules.map(r => (
                    <span key={r.label} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', color: r.passed ? 'var(--success)' : 'var(--gray-400)' }}>
                      {r.passed ? <CheckCircle size={11} /> : <span style={{ width: '11px', height: '11px', borderRadius: '50%', border: '1.5px solid var(--gray-300)', display: 'inline-block' }} />}
                      {r.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm password *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Re-enter password"
                required
              />
              {form.confirmPassword && (
                <p style={{ fontSize: '11px', marginTop: '4px', color: form.password === form.confirmPassword ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  {form.password === form.confirmPassword ? <><CheckCircle size={11} /> Passwords match</> : '⚠ Passwords do not match'}
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: '.5rem' }} disabled={loading}>
              {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : '🚀 Create account'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center', marginTop: '12px', lineHeight: '1.5' }}>
            By registering you agree to our terms. Your data is stored securely.
          </p>

          <p style={{ textAlign: 'center', marginTop: '.75rem', fontSize: '13px', color: 'var(--gray-500)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--brand)', fontWeight: '500' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
