import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const SKILLS_OPTIONS = ['Excel','SQL','Python','Tally','Java','C++','React','Node.js','Digital Marketing','Content Writing','Accounting','Data Entry','Photoshop','AutoCAD','Spoken English']

const STEPS = ['Education', 'Career goal', 'Skills & budget']

export default function Onboarding() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    city: '', education: '', stream: '', aspiration: '',
    experience: 'fresher', job_type: 'any', skills: [], budget_inr: 0
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleSkill = s => setForm(f => ({
    ...f,
    skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }))

  async function finish() {
    setLoading(true)
    await updateProfile(form)
    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'var(--gray-50)' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)' }}>Set up your profile</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginTop: '.25rem' }}>Tell us about yourself so we can find the right opportunities</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '4px', borderRadius: '2px', marginBottom: '6px',
                background: i <= step ? 'var(--brand)' : 'var(--gray-200)',
                transition: 'background .3s'
              }} />
              <span style={{ fontSize: '11px', color: i === step ? 'var(--brand)' : 'var(--gray-400)', fontWeight: i === step ? '600' : '400' }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="card">
          {step === 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.25rem' }}>Your education</h3>
              <div className="form-group">
                <label>City / Town</label>
                <input value={form.city} onChange={set('city')} placeholder="e.g. Pune, Delhi, Jaipur" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Highest education</label>
                  <select value={form.education} onChange={set('education')}>
                    <option value="">Select…</option>
                    <option value="10th">10th pass</option>
                    <option value="12th">12th pass</option>
                    <option value="diploma">Diploma</option>
                    <option value="bcom">B.Com</option>
                    <option value="ba">B.A.</option>
                    <option value="bsc">B.Sc.</option>
                    <option value="btech">B.Tech / B.E.</option>
                    <option value="bba">BBA</option>
                    <option value="mba">MBA</option>
                    <option value="mtech">M.Tech</option>
                    <option value="mca">MCA</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stream / Field</label>
                  <select value={form.stream} onChange={set('stream')}>
                    <option value="">Select…</option>
                    <option value="cs">Computer Science</option>
                    <option value="it">Information Technology</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts / Humanities</option>
                    <option value="science">Science</option>
                    <option value="engineering">Engineering (other)</option>
                    <option value="management">Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Experience level</label>
                <select value={form.experience} onChange={set('experience')}>
                  <option value="fresher">Fresher (0 years)</option>
                  <option value="0-1">Less than 1 year</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.25rem' }}>Your career goal</h3>
              <div className="form-group">
                <label>I want to become a…</label>
                <select value={form.aspiration} onChange={set('aspiration')}>
                  <option value="">Select role…</option>
                  <optgroup label="Tech">
                    <option value="Software Developer">Software Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Web Developer">Web Developer</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  </optgroup>
                  <optgroup label="Finance & Commerce">
                    <option value="Accountant">Accountant</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                    <option value="CA / CMA">CA / CMA</option>
                    <option value="Banking Professional">Banking Professional</option>
                    <option value="Tax Consultant">Tax Consultant</option>
                  </optgroup>
                  <optgroup label="Management & Marketing">
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="Digital Marketer">Digital Marketer</option>
                    <option value="HR Manager">HR Manager</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Business Analyst">Business Analyst</option>
                  </optgroup>
                  <optgroup label="Other">
                    <option value="Content Writer">Content Writer</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="Civil Engineer">Civil Engineer</option>
                    <option value="Teacher / Educator">Teacher / Educator</option>
                    <option value="Government Job">Government Job (SSC/UPSC)</option>
                  </optgroup>
                </select>
              </div>
              <div className="form-group">
                <label>Preferred job type</label>
                <select value={form.job_type} onChange={set('job_type')}>
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1.25rem' }}>Skills & learning budget</h3>
              <div className="form-group">
                <label>Skills you already have (select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {SKILLS_OPTIONS.map(s => (
                    <span key={s} className={`chip ${form.skills.includes(s) ? 'active' : ''}`} onClick={() => toggleSkill(s)}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Learning budget (₹): <strong>{form.budget_inr === 0 ? 'Free only' : `₹${Number(form.budget_inr).toLocaleString('en-IN')}`}</strong></label>
                <input type="range" min="0" max="15000" step="500" value={form.budget_inr}
                  onChange={e => setForm(f => ({ ...f, budget_inr: parseInt(e.target.value) }))}
                  style={{ marginTop: '8px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>
                  <span>₹0 (free only)</span><span>₹15,000</span>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            {step > 0
              ? <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}><ChevronLeft size={16} /> Back</button>
              : <div />
            }
            {step < STEPS.length - 1
              ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next <ChevronRight size={16} /></button>
              : <button className="btn btn-primary" onClick={finish} disabled={loading}>
                  {loading ? <span className="spinner" style={{ borderTopColor: '#fff' }} /> : 'Go to dashboard'}
                  {!loading && <ChevronRight size={16} />}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
