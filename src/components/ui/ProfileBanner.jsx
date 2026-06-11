import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, Circle, ChevronDown } from 'lucide-react'

const EDUCATION_OPTIONS = [
  { value: '10th', label: '10th pass' },
  { value: '12th', label: '12th pass' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bcom', label: 'B.Com' },
  { value: 'ba', label: 'B.A.' },
  { value: 'bsc', label: 'B.Sc.' },
  { value: 'btech', label: 'B.Tech / B.E.' },
  { value: 'bba', label: 'BBA' },
  { value: 'mba', label: 'MBA' },
  { value: 'mtech', label: 'M.Tech' },
  { value: 'mca', label: 'MCA' },
  { value: 'other', label: 'Other' },
]

const GOAL_OPTIONS = [
  'Software Developer', 'Data Analyst', 'Data Scientist', 'Web Developer',
  'Product Manager', 'Digital Marketer', 'Business Analyst', 'HR Manager',
  'Accountant', 'Financial Analyst', 'CA / CMA', 'Banking Professional',
  'Content Writer', 'Graphic Designer', 'Civil Engineer', 'Teacher / Educator',
  'Government Job (SSC/UPSC)',
]

export default function ProfileBanner() {
  const { updateProfile } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ city: '', education: '', aspiration: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const filled = {
    city: form.city.trim().length > 1,
    education: form.education !== '',
    aspiration: form.aspiration !== '',
  }
  const allFilled = filled.city && filled.education && filled.aspiration
  const filledCount = Object.values(filled).filter(Boolean).length

  async function save() {
    if (!allFilled) return
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    // isProfileComplete in context auto-updates, banner disappears
  }

  return (
    <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--warning)' }}>Complete your profile to unlock everything</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'city', label: 'City' },
              { key: 'education', label: 'Education' },
              { key: 'aspiration', label: 'Career goal' },
            ].map(({ key, label }) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: filled[key] ? 'var(--success)' : 'var(--warning)', fontWeight: '500' }}>
                {filled[key]
                  ? <CheckCircle size={13} />
                  : <Circle size={13} />}
                {label}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="btn btn-sm"
          style={{ background: 'var(--warning)', color: '#fff', borderColor: 'var(--warning)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {expanded ? 'Hide' : `Set up (${filledCount}/3)`}
          <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
        </button>
      </div>

      {expanded && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #fde68a', paddingTop: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>City *</label>
              <input value={form.city} onChange={set('city')} placeholder="e.g. Pune, Delhi" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Education *</label>
              <select value={form.education} onChange={set('education')}>
                <option value="">Select…</option>
                {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Career goal *</label>
              <select value={form.aspiration} onChange={set('aspiration')}>
                <option value="">Select…</option>
                {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={save}
              disabled={!allFilled || saving}
              className="btn btn-sm"
              style={{ background: allFilled ? 'var(--success)' : 'var(--gray-300)', color: '#fff', borderColor: 'transparent', opacity: allFilled ? 1 : .6 }}>
              {saving ? <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} /> : '✓ Save and unlock dashboard'}
            </button>
            {!allFilled && (
              <p style={{ fontSize: '12px', color: 'var(--warning)' }}>
                {3 - filledCount} field{3 - filledCount !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
