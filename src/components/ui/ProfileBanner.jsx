import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react'

const EDUCATION_OPTIONS = [
  { value:'10th',label:'10th pass' },{ value:'12th',label:'12th pass' },
  { value:'diploma',label:'Diploma' },{ value:'bcom',label:'B.Com' },
  { value:'ba',label:'B.A.' },{ value:'bsc',label:'B.Sc.' },
  { value:'btech',label:'B.Tech / B.E.' },{ value:'bba',label:'BBA' },
  { value:'mba',label:'MBA' },{ value:'mtech',label:'M.Tech' },
  { value:'mca',label:'MCA' },{ value:'other',label:'Other' },
]

const GOAL_OPTIONS = [
  'Software Developer','Data Analyst','Data Scientist','Web Developer',
  'Product Manager','DevOps Engineer','UI/UX Designer',
  'Accountant','Financial Analyst','CA / CMA','Banking Professional',
  'Marketing Manager','Digital Marketer','HR Manager','Business Analyst',
  'Content Writer','Graphic Designer','Civil Engineer',
  'Teacher / Educator','Government Job (SSC/UPSC)',
]

export default function ProfileBanner() {
  const { updateProfile } = useAuth()
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ city:'', education:'', aspiration:'' })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const filled = {
    city: form.city.trim().length > 1,
    education: form.education !== '',
    aspiration: form.aspiration !== '',
  }
  const filledCount = Object.values(filled).filter(Boolean).length
  const allFilled = filledCount === 3

  async function save() {
    if (!allFilled) return
    setSaving(true)
    await updateProfile(form)
    setSaving(false)
    setSaved(true)
    // isProfileComplete auto-updates in context → banner disappears
  }

  if (dismissed || saved) return null

  const FIELDS = [
    { key:'city',     label:'City' },
    { key:'education',label:'Education' },
    { key:'aspiration',label:'Career goal' },
  ]

  return (
    <div style={{ border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>
      {/* Banner header */}
      <div style={{ background: 'var(--warning-light)', padding: '10px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--warning)', marginBottom: '6px' }}>
            Complete your profile to unlock personalised results
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {FIELDS.map(({ key, label }) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: filled[key] ? 'var(--success)' : 'var(--warning)', fontWeight: '500', transition: 'color .2s' }}>
                {filled[key] ? <CheckCircle size={12} /> : <Circle size={12} />}
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setExpanded(e => !e)} className="btn btn-sm"
            style={{ background: 'var(--warning)', color: '#fff', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '5px 12px' }}>
            {expanded ? 'Hide' : `Fill in (${filledCount}/3)`}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button onClick={() => setDismissed(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', padding: '4px', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Inline expand form — no redirect needed */}
      {expanded && (
        <div style={{ background: '#fff', borderTop: '1px solid #fde68a', padding: '12px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label>City *</label>
              <input value={form.city} onChange={set('city')} placeholder="e.g. Pune, Delhi" />
            </div>
            <div>
              <label>Education *</label>
              <select value={form.education} onChange={set('education')}>
                <option value="">Select…</option>
                {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label>Career goal *</label>
              <select value={form.aspiration} onChange={set('aspiration')}>
                <option value="">Select…</option>
                {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={save} disabled={!allFilled || saving} className="btn btn-sm"
              style={{ background: allFilled ? 'var(--success)' : 'var(--gray-300)', color: '#fff', borderColor: 'transparent', opacity: allFilled ? 1 : .55, display: 'flex', alignItems: 'center', gap: '5px' }}>
              {saving
                ? <><span className="spinner" style={{ width: '13px', height: '13px', borderTopColor: '#fff' }} /> Saving…</>
                : <><CheckCircle size={13} /> Save and unlock</>
              }
            </button>
            {!allFilled && (
              <p style={{ fontSize: '12px', color: 'var(--warning)' }}>
                {3 - filledCount} field{3 - filledCount !== 1 ? 's' : ''} still needed
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
