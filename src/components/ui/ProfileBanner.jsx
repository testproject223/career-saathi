import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CheckCircle, X, ChevronDown, ChevronUp } from 'lucide-react'
import CitySelect from './CitySelect'

const EDUCATION_OPTIONS = [
  {value:'10th',label:'10th pass'},{value:'12th',label:'12th pass'},
  {value:'diploma',label:'Diploma'},{value:'bcom',label:'B.Com'},
  {value:'ba',label:'B.A.'},{value:'bsc',label:'B.Sc.'},
  {value:'btech',label:'B.Tech / B.E.'},{value:'bba',label:'BBA'},
  {value:'mba',label:'MBA'},{value:'mtech',label:'M.Tech'},
  {value:'mca',label:'MCA'},{value:'other',label:'Other'},
]
const GOAL_OPTIONS = [
  'Software Developer','Data Analyst','Data Scientist','Web Developer',
  'Product Manager','DevOps Engineer','UI/UX Designer',
  'Accountant','Financial Analyst','CA / CMA','Banking Professional',
  'Marketing Manager','Digital Marketer','HR Manager','Business Analyst',
  'Content Writer','Graphic Designer','Civil Engineer',
  'Teacher / Educator','Government Job (SSC/UPSC)',
]
const EXP_SLABS = [
  {value:'0-2',label:'0–2 yrs'},{value:'2-5',label:'2–5 yrs'},
  {value:'5-8',label:'5–8 yrs'},{value:'8-12',label:'8–12 yrs'},
  {value:'12+',label:'12+ yrs'},
]

export default function ProfileBanner() {
  const { updateProfile } = useAuth()
  const [expanded, setExpanded] = useState(true) // open by default
  const [dismissed, setDismissed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    city:'', education:'', aspiration:'', experience_slab:'0-2'
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
    setDone(true)
    // isProfileComplete auto-updates in context → banner disappears after 2s
    setTimeout(() => setDismissed(true), 2200)
  }

  if (dismissed) return null

  // Celebration state
  if (done) return (
    <div style={{
      background: 'var(--success-light)', border: '1.5px solid var(--success)',
      borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
      marginBottom: '1.25rem', textAlign: 'center', animation: 'fadeIn .4s ease',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
      <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>Profile complete!</p>
      <p style={{ fontSize: '13px', color: 'var(--success)', opacity: .85 }}>
        All your personalised recommendations, jobs, courses and CTC insights are now live.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', fontSize: '13px', color: 'var(--success)' }}>
        {[['✓','City set'],['✓','Education set'],['✓','Career goal set'],['✓','Experience set']].map(([icon, label]) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{icon} {label}</span>
        ))}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )

  return (
    <div style={{ border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.25rem' }}>

      {/* Header row */}
      <div style={{ background: 'var(--warning-light)', padding: '10px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: '600', fontSize: '13px', color: 'var(--warning)', marginBottom: '6px' }}>
            Complete your profile to unlock everything
          </p>
          {/* Field indicator dots */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { key: 'city',      label: 'City' },
              { key: 'education', label: 'Education' },
              { key: 'aspiration',label: 'Career goal' },
            ].map(({ key, label }) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '500', color: filled[key] ? 'var(--success)' : 'var(--warning)', transition: 'color .25s' }}>
                {filled[key] ? <CheckCircle size={12} /> : <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1.5px solid var(--warning)', display: 'inline-block' }} />}
                {label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
          <button onClick={() => setExpanded(e => !e)} className="btn btn-sm"
            style={{ background: 'var(--warning)', color: '#fff', borderColor: 'transparent', fontSize: '12px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {expanded ? 'Hide' : `Fill in (${filledCount}/3)`}
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button onClick={() => setDismissed(true)} title="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', padding: '4px', display: 'flex' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Inline form — expands in place, no redirect */}
      {expanded && (
        <div style={{ background: '#fff', borderTop: '1px solid #fde68a', padding: '14px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            {/* City with autocomplete */}
            <div>
              <label>City *</label>
              <CitySelect value={form.city} onChange={v => setVal('city', v)} placeholder="Type city…" />
            </div>

            {/* Education */}
            <div>
              <label>Education *</label>
              <select value={form.education} onChange={set('education')}>
                <option value="">Select…</option>
                {EDUCATION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Career goal */}
            <div>
              <label>Career goal *</label>
              <select value={form.aspiration} onChange={set('aspiration')}>
                <option value="">Select…</option>
                {GOAL_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Experience slab */}
          <div style={{ marginBottom: '12px' }}>
            <label>Experience</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '5px' }}>
              {EXP_SLABS.map(s => (
                <span key={s.value} onClick={() => setVal('experience_slab', s.value)}
                  className={`chip ${form.experience_slab === s.value ? 'active' : ''}`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'var(--gray-100)', borderRadius: '2px', marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${(filledCount / 3) * 100}%`, height: '100%', background: allFilled ? 'var(--success)' : 'var(--warning)', borderRadius: '2px', transition: 'width .3s, background .3s' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={save} disabled={!allFilled || saving} className="btn btn-sm"
              style={{ background: allFilled ? 'var(--success)' : 'var(--gray-300)', color: '#fff', borderColor: 'transparent', display: 'flex', alignItems: 'center', gap: '5px', opacity: allFilled ? 1 : .55 }}>
              {saving
                ? <><span className="spinner" style={{ width: '13px', height: '13px', borderTopColor: '#fff' }} /> Saving…</>
                : <><CheckCircle size={13} /> Save and unlock dashboard</>}
            </button>
            {!allFilled && (
              <p style={{ fontSize: '12px', color: 'var(--warning)' }}>
                {3 - filledCount} required field{3 - filledCount !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
