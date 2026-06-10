import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, X, Plus, ExternalLink } from 'lucide-react'

const STICKERS = [
  { emoji: '🌟', msg: 'Dedication + Patience = Your career breakthrough.' },
  { emoji: '💪', msg: 'Hard work today, opportunities tomorrow.' },
  { emoji: '🎯', msg: 'Every step forward counts — keep going.' },
  { emoji: '🔥', msg: 'You\'re building something real. Stay consistent.' },
  { emoji: '🧠', msg: 'Your brain gets stronger with every lesson.' },
]

const SERVICE_META = {
  jobs:      { icon: '💼', label: 'Find a job',        desc: 'Live matched roles in India', cost: 0,    to: '/jobs' },
  resume:    { icon: '📄', label: 'Resume + LinkedIn', desc: 'AI-generated ATS resume + profile copy', cost: 0, to: '/resume' },
  courses:   { icon: '📚', label: 'Courses',           desc: 'Curated free + paid courses',  cost: 3200, to: '/courses' },
  interview: { icon: '🎤', label: 'Interview prep',    desc: 'Mock Q&A + readiness score',   cost: 0,    to: '/interview' },
  projects:  { icon: '💡', label: 'Portfolio projects',desc: 'Open source + project ideas',  cost: 999,  to: '/projects' },
  plan:      { icon: '🚀', label: 'Learning plan',     desc: 'Full roadmap',                 cost: 0,    to: '/start-learning' },
}

const ADDABLE = ['jobs','resume','courses','interview','projects']

const WEEK_PLAN = {
  'Data Analyst':       ['Week 1–2: Excel + SQL basics (YouTube, free)','Week 3–4: Python fundamentals (NPTEL, free)','Week 5–8: Google Data Analytics Certificate (Coursera)','Week 9–10: Build Kaggle dashboard project','Week 11–12: Open source contribution + job applications'],
  'Software Developer': ['Week 1–2: HTML/CSS/JavaScript basics','Week 3–5: React fundamentals (freeCodeCamp)','Week 6–8: Node.js + API building','Week 9–10: Full-stack portfolio project','Week 11–12: GitHub contributions + job applications'],
  'Product Manager':    ['Week 1–2: PM fundamentals (YouTube + blogs)','Week 3–5: SQL for PMs (Coursera free)','Week 6–8: Product Strategy certification','Week 9–10: Case study portfolio','Week 11–12: PM interview prep + networking'],
  'Digital Marketer':   ['Week 1–2: SEO + SEM basics (YouTube, free)','Week 3–5: Google Analytics setup','Week 6–8: Google Digital Marketing Certificate','Week 9–10: Run a mock campaign','Week 11–12: LinkedIn + portfolio + apply'],
  'default':            ['Week 1–2: Foundation skills (free resources)','Week 3–4: Core technical skills','Week 5–8: Main certification','Week 9–10: Portfolio project','Week 11–12: Apply and network'],
}

export default function StartLearning() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState([])
  const [savedCourses, setSavedCourses] = useState([])
  const [checkedOut, setCheckedOut] = useState(false)
  const [sticker] = useState(STICKERS[Math.floor(Math.random() * STICKERS.length)])

  const incomingServices = location.state?.selectedServices || []

  useEffect(() => {
    loadSavedCourses()
    // Build initial items from incoming selected services
    if (incomingServices.length > 0) {
      const built = incomingServices
        .filter(id => SERVICE_META[id])
        .map(id => ({ ...SERVICE_META[id], id }))
      setItems(built)
    } else {
      setItems(Object.entries(SERVICE_META).slice(0, 3).map(([id, v]) => ({ ...v, id })))
    }
  }, [])

  async function loadSavedCourses() {
    if (!profile?.id) return
    const { data } = await supabase.from('course_selections').select('*').eq('user_id', profile.id).eq('is_enrolled', true)
    if (data) setSavedCourses(data)
  }

  function removeItem(id) {
    setItems(prev => prev.filter(x => x.id !== id))
  }

  function addItem(id) {
    if (items.find(x => x.id === id)) return
    setItems(prev => [...prev, { ...SERVICE_META[id], id }])
  }

  const totalCost = items.reduce((s, x) => s + (x.cost || 0), 0)
  const freeItems = items.filter(x => x.cost === 0)
  const paidItems = items.filter(x => x.cost > 0)
  const addable   = ADDABLE.filter(id => !items.find(x => x.id === id))
  const role      = profile?.aspiration || 'default'
  const expSlab   = profile?.experience_slab || '0-2'
  const weekPlan  = WEEK_PLAN[role] || WEEK_PLAN['default']
  const ctcRange  = profile?.last_ctc_lpa ? `₹${parseFloat(profile.last_ctc_lpa) + 5}L+` : '₹3L+'

  if (checkedOut) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>
        <div style={{ fontSize: '72px', marginBottom: '1rem', animation: 'pop .5s ease' }}>🎉</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '.5rem' }}>You're all set, {profile?.name?.split(' ')[0]}!</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '2rem' }}>Your learning plan is locked in. Now it's just about showing up every day.</p>

        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', color: '#fff' }}>
          <div style={{ fontSize: '56px', marginBottom: '1rem' }}>🌟</div>
          <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '.75rem' }}>Dedication & Patience</p>
          <p style={{ fontSize: '14px', opacity: .9, lineHeight: '1.7', fontStyle: 'italic' }}>
            "With great experience comes great responsibility — and the market will reward it. Go get what you deserve."
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '1.25rem', fontSize: '24px' }}>
            <span>💪</span><span>📚</span><span>🎯</span><span>✨</span>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.8)', marginTop: '1rem', fontWeight: '500' }}>
            Your path to {ctcRange} starts NOW
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items[0]?.to && (
            <button onClick={() => navigate(items[0].to)} className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
              {items[0].icon} Start with {items[0].label} →
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ justifyContent: 'center' }}>Back to dashboard</button>
        </div>
        <style>{`@keyframes pop{0%{transform:scale(0)}80%{transform:scale(1.1)}100%{transform:scale(1)}}`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '2rem 0', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)' }}>
      <div className="page-container" style={{ maxWidth: '720px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '52px', marginBottom: '10px' }}>{sticker.emoji}</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '.5rem' }}>My Learning Plan</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', fontStyle: 'italic' }}>"{sticker.msg}"</p>
        </div>

        {/* Dedication banner */}
        <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '14px', color: '#fff' }}>
          <div style={{ fontSize: '32px', flexShrink: 0 }}>💪</div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '3px' }}>
              {expSlab === '0-2' ? 'Dedication + Patience = Success' : 'With great experience comes great responsibility'}
            </p>
            <p style={{ fontSize: '13px', opacity: .85 }}>
              {expSlab === '0-2'
                ? 'Every great career was built one day at a time. You\'ve got this!'
                : 'The market will reward your expertise. Time to grow hard and claim what you deserve.'}
            </p>
          </div>
        </div>

        {/* Cost summary tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total cost',     val: totalCost === 0 ? 'Free!' : `₹${totalCost.toLocaleString('en-IN')}`, color: totalCost === 0 ? 'var(--success)' : 'var(--warning)', bg: totalCost === 0 ? 'var(--success-light)' : 'var(--warning-light)' },
            { label: 'Free services',  val: freeItems.length, color: 'var(--success)', bg: 'var(--success-light)' },
            { label: 'Paid services',  val: paidItems.length, color: paidItems.length > 0 ? 'var(--warning)' : 'var(--gray-400)', bg: 'var(--gray-100)' },
          ].map(m => (
            <div key={m.label} style={{ background: m.bg, borderRadius: 'var(--radius-md)', padding: '.875rem', textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: m.color }}>{m.val}</p>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* Editable service list */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1rem' }}>Your selected services</p>
          {items.length === 0 && (
            <p style={{ color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center', padding: '1rem' }}>No services selected. Add some below.</p>
          )}
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '6px' }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-900)' }}>{item.label}</p>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{item.desc}</p>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', background: item.cost === 0 ? 'var(--success-light)' : 'var(--warning-light)', color: item.cost === 0 ? 'var(--success)' : 'var(--warning)', flexShrink: 0 }}>
                {item.cost === 0 ? 'Free' : `₹${item.cost.toLocaleString('en-IN')}`}
              </span>
              {item.to && (
                <button onClick={() => navigate(item.to)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', flexShrink: 0, padding: '4px' }}>
                  <ExternalLink size={14} />
                </button>
              )}
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', flexShrink: 0, padding: '4px' }}>
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Saved courses from course page */}
          {savedCourses.length > 0 && (
            <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: '10px', paddingTop: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '8px', fontWeight: '500' }}>YOUR SAVED COURSES</p>
              {savedCourses.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', marginBottom: '5px' }}>
                  <span style={{ fontSize: '16px' }}>📚</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500' }}>{c.course_name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{c.platform}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: c.cost_inr === 0 ? 'var(--success-light)' : 'var(--warning-light)', color: c.cost_inr === 0 ? 'var(--success)' : 'var(--warning)' }}>
                    {c.cost_inr === 0 ? 'Free' : `₹${c.cost_inr}`}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add more services */}
          {addable.length > 0 && (
            <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: '10px', paddingTop: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '8px', fontWeight: '500' }}>ADD MORE</p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {addable.map(id => (
                  <span key={id} onClick={() => addItem(id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', background: 'var(--gray-100)', border: '1px solid var(--gray-200)', color: 'var(--gray-600)', cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}>
                    <Plus size={11} /> {SERVICE_META[id]?.label}
                    {SERVICE_META[id]?.cost > 0 && <span style={{ color: 'var(--warning)' }}> (₹{SERVICE_META[id].cost})</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 12-week roadmap */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1rem' }}>📅 12-week roadmap — <span style={{ color: 'var(--brand)' }}>{role}</span></p>
          {weekPlan.map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '.875rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <p style={{ fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.5', paddingTop: '3px' }}>{w}</p>
            </div>
          ))}
        </div>

        {/* Cost breakdown */}
        {totalCost > 0 && (
          <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--warning)', marginBottom: '.75rem' }}>💳 Cost breakdown</p>
            {paidItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gray-700)' }}>{item.label}</span>
                <span style={{ fontWeight: '600', color: 'var(--warning)' }}>₹{item.cost.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {savedCourses.filter(c => c.cost_inr > 0).map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--gray-700)' }}>{c.course_name}</span>
                <span style={{ fontWeight: '600', color: 'var(--warning)' }}>₹{c.cost_inr.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #fde68a', marginTop: '.75rem', paddingTop: '.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700' }}>
              <span>Total</span>
              <span style={{ color: 'var(--warning)' }}>₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '.5rem' }}>
              💡 A ₹{totalCost.toLocaleString('en-IN')} investment can add ₹3–8L to your annual CTC at your experience level.
            </p>
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/courses')} className="btn btn-outline">← Add more courses</button>
          <button onClick={() => setCheckedOut(true)} className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', padding: '14px 32px' }}>
            {totalCost > 0 ? `🚀 Start Learning — ₹${totalCost.toLocaleString('en-IN')}` : '🚀 Start Learning — Free!'}
          </button>
        </div>
      </div>
    </div>
  )
}
