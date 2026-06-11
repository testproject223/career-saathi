import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import ProfileBanner from '../components/ui/ProfileBanner'
import { CTC_MAP, getPersonaLine } from '../lib/persona'

const INDIA_FACTS = [
  { tag: 'India · AI & Jobs',      text: 'India added 1.4 lakh AI-related jobs in 2024 — yet 68% of resumes never pass ATS filters. An optimised resume is now a basic career survival skill.' },
  { tag: 'India · Salary insight', text: 'Professionals who negotiate their offer in India earn ₹1.5–4L more per year than those who accept the first number. Every conversation counts.' },
  { tag: 'India · LinkedIn',       text: 'Over 9.5 crore Indians are on LinkedIn but only 12% have a complete profile. A strong headline alone increases recruiter views by 14×.' },
  { tag: 'India · Interviews',     text: '70% of Indian job seekers fail at the first interview — not due to lack of skill, but lack of structured preparation. Mock practice changes this.' },
  { tag: 'India · Hiring trends',  text: '52% of Indian recruiters now use AI tools to shortlist candidates before any human review. Keywords and format are no longer optional.' },
]

const SERVICES = [
  { id: 'jobs',      icon: '💼', label: 'Find a job',        sub: 'Live roles · matched to you',       cost: 0,    to: '/jobs' },
  { id: 'resume',    icon: '📄', label: 'Resume + LinkedIn', sub: 'AI-generated · ATS-ready',           cost: 0,    to: '/resume' },
  { id: 'courses',   icon: '📚', label: 'Learn and apply',   sub: '₹0–3,200 · pick courses',            cost: 0,    to: '/courses' },
  { id: 'interview', icon: '🎤', label: 'Interview prep',    sub: 'Free · mock Q&A + score',            cost: 0,    to: '/interview' },
  { id: 'projects',  icon: '💡', label: 'Build portfolio',   sub: '₹0–999 · open source + ideas',       cost: 0,    to: '/projects' },
  { id: 'plan',      icon: '🚀', label: 'My learning plan',  sub: 'Full roadmap · cost summary',        cost: 0,    to: '/start-learning' },
]

export default function Dashboard() {
  const { profile, isProfileComplete } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(new Set(['jobs']))
  const [showBanner, setShowBanner] = useState(false)
  const [factIdx, setFactIdx] = useState(0)
  const [factVisible, setFactVisible] = useState(true)
  const factTimer = useRef(null)

  const expSlab = profile?.experience_slab || '0-2'
  const sector   = profile?.sector || 'private'
  const ctcData  = CTC_MAP[expSlab]?.[sector] || CTC_MAP['0-2'].private
  const persona  = getPersonaLine(expSlab)
  const lastCtc  = parseFloat(profile?.last_ctc_lpa) || 0
  const showDeserving = expSlab !== '0-2' && lastCtc >= 10

  // Show banner 1s after load
  useEffect(() => {
    const t = setTimeout(() => setShowBanner(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // Rotate facts every 5s
  useEffect(() => {
    factTimer.current = setInterval(() => {
      setFactVisible(false)
      setTimeout(() => {
        setFactIdx(i => (i + 1) % INDIA_FACTS.length)
        setFactVisible(true)
      }, 400)
    }, 5000)
    return () => clearInterval(factTimer.current)
  }, [])

  function toggleService(id) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const totalCost = [...selected].reduce((sum, id) => {
    const s = SERVICES.find(x => x.id === id)
    return sum + (s?.cost || 0)
  }, 0)

  const firstDest = SERVICES.find(s => selected.has(s.id))?.to || '/jobs'
  const bannerLabel = selected.size === 1
    ? `Let's go — ${SERVICES.find(s => selected.has(s.id))?.label}`
    : `${selected.size} services selected · ${totalCost === 0 ? 'Free' : '₹' + totalCost.toLocaleString('en-IN')}`

  const fact = INDIA_FACTS[factIdx]


  return (
    <div style={{ padding: '1.5rem 0', paddingBottom: '100px' }}>
      <div className="page-container" style={{ maxWidth: '740px' }}>

        {/* नमस्ते greeting */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '44px', lineHeight: 1, opacity: .85, flexShrink: 0, marginTop: '2px' }}>🙏</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '22px', fontWeight: '500', fontFamily: 'serif' }}>नमस्ते,</span>
              <span style={{ fontSize: '17px', color: 'var(--gray-500)' }}>{profile?.name?.split(' ')[0] || 'there'}</span>
            </div>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginTop: '4px', lineHeight: '1.6' }}>{persona}</p>
          </div>
        </div>

        {/* Smart inline profile banner — disappears after all fields filled */}
        {!isProfileComplete && <ProfileBanner />}

        {/* CTC card */}
        {isProfileComplete && (
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderLeft: '4px solid var(--brand)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--brand)', marginBottom: '4px' }}>{ctcData.line}</p>
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.6' }}>{ctcData.sub}</p>
                {showDeserving && (
                  <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '500', marginTop: '6px' }}>
                    ✨ With ₹{lastCtc}L last CTC — your next role should be higher. You have earned it.
                  </p>
                )}
                {expSlab !== '0-2' && !showDeserving && (
                  <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '500', marginTop: '6px' }}>
                    💪 Time to grow hard — your experience is your biggest asset. Claim what you deserve.
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>{ctcData.range}</p>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>
                  {expSlab === '0-2' ? 'expected first CTC' : showDeserving ? 'you deserve this CTC' : 'target CTC range'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rotating India facts */}
        <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderLeft: '4px solid var(--warning)', borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '72px' }}>
          <span style={{ fontSize: '20px', flexShrink: 0 }}>💡</span>
          <div style={{ flex: 1, transition: 'opacity .4s, transform .4s', opacity: factVisible ? 1 : 0, transform: factVisible ? 'translateY(0)' : 'translateY(-6px)' }}>
            <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '3px' }}>{fact.tag}</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-800)', lineHeight: '1.6' }}>{fact.text}</p>
          </div>
          <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
            {INDIA_FACTS.map((_, i) => (
              <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === factIdx ? 'var(--warning)' : 'var(--gray-300)', transition: 'background .3s' }} />
            ))}
          </div>
        </div>

        {/* Multi-select services */}
        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '10px' }}>
          Select what you want to do — pick multiple
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '8px' }}>
          {SERVICES.map(s => {
            const isSel = selected.has(s.id)
            return (
              <div key={s.id} onClick={() => toggleService(s.id)} style={{ background: '#fff', border: `${isSel ? '2px' : '1px'} solid ${isSel ? 'var(--brand)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-lg)', padding: '12px', cursor: 'pointer', transition: 'all .15s', textAlign: 'center', position: 'relative', background: isSel ? 'var(--brand-light)' : '#fff' }}>
                {isSel && (
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                )}
                <div style={{ fontSize: '22px', marginBottom: '5px' }}>{s.icon}</div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: isSel ? 'var(--brand)' : 'var(--gray-800)' }}>{s.label}</p>
                <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>{s.sub}</p>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'center', marginBottom: '4px' }}>
          {selected.size} service{selected.size !== 1 ? 's' : ''} selected · {totalCost === 0 ? '₹0 estimated cost' : `₹${totalCost.toLocaleString('en-IN')} estimated`}
        </p>
      </div>

      {/* Floating bottom banner */}
      {showBanner && selected.size > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, animation: 'slideUp .5s ease forwards', width: 'auto', minWidth: '340px', maxWidth: '500px' }}>
          <div style={{ background: '#fff', border: '1.5px solid var(--brand)', borderRadius: '20px', padding: '12px 16px 12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', boxShadow: '0 4px 24px rgba(37,99,235,.2)' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-900)' }}>{bannerLabel}</p>
              <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px' }}>
                {totalCost === 0 ? 'All selected services are free' : `₹${totalCost.toLocaleString('en-IN')} total · edit in My Plan`}
              </p>
            </div>
            <button onClick={() => {
              if (selected.size === 1) navigate(firstDest)
              else navigate('/start-learning', { state: { selectedServices: [...selected] } })
            }} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--brand)', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', animation: 'pulse 2s infinite' }}>
              Ready to go <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translate(-50%,20px) } to { opacity:1; transform:translate(-50%,0) } }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,.3)} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0)} }
      `}</style>
    </div>
  )
}
