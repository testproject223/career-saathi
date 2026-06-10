import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { CheckCircle, ArrowLeft, ExternalLink, Heart } from 'lucide-react'

const COURSE_COSTS = {
  'Google Data Analytics Certificate': { cost: 3200, platform: 'Coursera', free: false, url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
  'Google Digital Marketing Certificate': { cost: 3200, platform: 'Coursera', free: false, url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce' },
  'SQL Tutorial': { cost: 0, platform: 'YouTube', free: true, url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY' },
  'Python for Data Analysis': { cost: 0, platform: 'YouTube', free: true, url: 'https://www.youtube.com/watch?v=vmEHCJofslg' },
  'Data Analysis using Python - NPTEL': { cost: 0, platform: 'NPTEL', free: true, url: 'https://nptel.ac.in/courses/106106212' },
  'Data Analytics Free Course': { cost: 0, platform: 'Great Learning', free: true, url: 'https://www.mygreatlearning.com/data-analytics/free-courses' },
}

const STICKERS = [
  { emoji: '🌱', msg: 'Every expert was once a beginner. Your journey starts today.' },
  { emoji: '⚡', msg: 'Consistency beats talent. Show up every day.' },
  { emoji: '🔥', msg: 'You\'re building something real. Keep going.' },
  { emoji: '🧠', msg: 'Your brain is getting stronger with every lesson.' },
  { emoji: '🏆', msg: 'Your future self is cheering you on right now.' },
  { emoji: '🌟', msg: 'Dedication + Patience = Success. You have both.' },
  { emoji: '💪', msg: 'Hard work today, opportunities tomorrow.' },
  { emoji: '🎯', msg: 'Every line of code, every dataset — it all counts.' },
]

const WEEK_PLAN = {
  'Data Analyst': ['Week 1–2: Excel & SQL basics (YouTube free)', 'Week 3–4: Python fundamentals (NPTEL)', 'Week 5–8: Google Data Analytics Certificate (Coursera)', 'Week 9–10: Build your first Kaggle project', 'Week 11–12: Contribute to open source + update LinkedIn'],
  'Software Developer': ['Week 1–2: HTML/CSS/JavaScript basics', 'Week 3–5: React fundamentals (freeCodeCamp)', 'Week 6–8: Node.js + API building', 'Week 9–10: Build full-stack project', 'Week 11–12: GitHub contributions + job applications'],
  'Digital Marketer': ['Week 1–2: SEO & SEM basics (YouTube)', 'Week 3–4: Google Analytics setup', 'Week 5–8: Google Digital Marketing Certificate', 'Week 9–10: Run a mock campaign', 'Week 11–12: Build portfolio + LinkedIn'],
  'default': ['Week 1–2: Foundation skills (free)', 'Week 3–4: Core technical skills', 'Week 5–8: Certification', 'Week 9–10: Portfolio project', 'Week 11–12: Apply & network'],
}

export default function StartLearning() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [savedCourses, setSavedCourses] = useState([])
  const [sticker] = useState(STICKERS[Math.floor(Math.random() * STICKERS.length)])
  const [checkedOut, setCheckedOut] = useState(false)
  const selectedProjects = location.state?.selectedProjects || []

  useEffect(() => {
    loadSavedCourses()
  }, [])

  async function loadSavedCourses() {
    if (!profile?.id) return
    const { data } = await supabase.from('course_selections').select('*').eq('user_id', profile.id).eq('is_enrolled', true)
    if (data) setSavedCourses(data)
  }

  const role = profile?.aspiration || 'default'
  const weekPlan = WEEK_PLAN[role] || WEEK_PLAN['default']
  const freeCourses = savedCourses.filter(c => c.cost_inr === 0)
  const paidCourses = savedCourses.filter(c => c.cost_inr > 0)
  const totalCost = paidCourses.reduce((sum, c) => sum + (c.cost_inr || 0), 0)

  const allItems = [
    ...freeCourses.map(c => ({ name: c.course_name, type: 'course', cost: 0, platform: c.platform, url: c.url })),
    ...paidCourses.map(c => ({ name: c.course_name, type: 'course', cost: c.cost_inr, platform: c.platform, url: c.url })),
    ...selectedProjects.map(p => ({ name: p, type: 'project', cost: 0, platform: 'GitHub', url: '#' })),
  ]

  return (
    <div style={{ padding: '2rem 0', minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf4ff 100%)' }}>
      <div className="page-container" style={{ maxWidth: '720px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back
        </button>

        {!checkedOut ? (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '56px', marginBottom: '1rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.1))' }}>{sticker.emoji}</div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '.5rem' }}>Your Learning Plan</h1>
              <p style={{ color: 'var(--gray-500)', fontSize: '15px', maxWidth: '400px', margin: '0 auto', fontStyle: 'italic' }}>"{sticker.msg}"</p>
            </div>

            {/* Dedication sticker */}
            <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: '#fff' }}>
              <div style={{ fontSize: '32px' }}>🌟</div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '3px' }}>Dedication + Patience = Success</p>
                <p style={{ fontSize: '13px', opacity: '.85' }}>Every great career was built one day at a time. You've got this, {profile?.name?.split(' ')[0] || 'champion'}!</p>
              </div>
              <Heart size={20} style={{ marginLeft: 'auto', opacity: .8, flexShrink: 0 }} />
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '1.5rem' }}>
              {[
                { label: 'Free items', value: freeCourses.length + selectedProjects.length, color: 'var(--success)', bg: 'var(--success-light)' },
                { label: 'Paid courses', value: paidCourses.length, color: 'var(--warning)', bg: 'var(--warning-light)' },
                { label: 'Total cost', value: totalCost === 0 ? 'Free!' : `₹${totalCost.toLocaleString('en-IN')}`, color: 'var(--brand)', bg: 'var(--brand-light)' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: 'var(--radius-md)', padding: '.875rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: s.color }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Week-by-week plan */}
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1rem' }}>📅 12-week roadmap for <span style={{ color: 'var(--brand)' }}>{role}</span></h3>
              {weekPlan.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--brand)', color: '#fff', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.5', paddingTop: '3px' }}>{w}</p>
                </div>
              ))}
            </div>

            {/* Selected items */}
            {allItems.length > 0 && (
              <div className="card" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1rem' }}>📦 Your selected items ({allItems.length})</h3>
                {allItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.625rem', background: i % 2 === 0 ? 'var(--gray-50)' : '#fff', borderRadius: 'var(--radius-sm)', marginBottom: '4px', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <span style={{ fontSize: '16px' }}>{item.type === 'project' ? '⭐' : item.cost === 0 ? '✅' : '🎓'}</span>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-900)' }}>{item.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{item.platform} · {item.type === 'project' ? 'Open source project' : 'Course'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <span className={`badge ${item.cost === 0 ? 'badge-green' : 'badge-yellow'}`}>{item.cost === 0 ? 'Free' : `₹${item.cost}`}</span>
                      {item.url && item.url !== '#' && <a href={item.url} target="_blank" rel="noreferrer" style={{ color: 'var(--gray-400)' }}><ExternalLink size={12} /></a>}
                    </div>
                  </div>
                ))}
                {allItems.length === 0 && <p style={{ color: 'var(--gray-400)', fontSize: '13px', textAlign: 'center' }}>Go to Courses and Projects to add items to your plan</p>}
              </div>
            )}

            {/* Cost breakdown if paid */}
            {totalCost > 0 && (
              <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--warning)', marginBottom: '.75rem' }}>💳 Payment breakdown</p>
                {paidCourses.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--gray-700)' }}>{c.course_name}</span>
                    <span style={{ fontWeight: '600', color: 'var(--warning)' }}>₹{c.cost_inr.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #fde68a', marginTop: '.75rem', paddingTop: '.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700' }}>
                  <span>Total investment</span>
                  <span style={{ color: 'var(--warning)' }}>₹{totalCost.toLocaleString('en-IN')}</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '.5rem' }}>💡 Average ROI: a ₹3,200 Google certificate can add ₹2–5L to your annual salary</p>
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '.5rem' }}>
              <button onClick={() => navigate('/courses')} className="btn btn-outline">← Add more courses</button>
              <button onClick={() => setCheckedOut(true)} className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', padding: '14px 32px' }}>
                {totalCost > 0 ? `🚀 Start Learning — ₹${totalCost.toLocaleString('en-IN')} total` : '🚀 Start Learning — Free!'}
              </button>
            </div>
          </>
        ) : (
          /* Checkout / confirmation screen */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '72px', marginBottom: '1rem', animation: 'pop .5s ease' }}>🎉</div>
            <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '.75rem' }}>You're all set, {profile?.name?.split(' ')[0]}!</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '15px', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Your learning plan is locked in. Now it's just about showing up every day.</p>

            {/* Big dedication sticker */}
            <div style={{ background: 'linear-gradient(135deg, #f0f4ff, #fdf4ff)', border: '2px solid #e0e7ff', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
              <div style={{ fontSize: '64px', marginBottom: '1rem' }}>🌟</div>
              <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '.75rem' }}>Dedication & Patience</p>
              <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.7', fontStyle: 'italic' }}>
                "The person who says it cannot be done should not interrupt the person doing it."
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '1.25rem', fontSize: '24px' }}>
                <span>💪</span><span>📚</span><span>🎯</span><span>✨</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--brand)', marginTop: '1rem', fontWeight: '600' }}>
                Your 12-week journey to becoming a {role} starts NOW
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px', margin: '0 auto' }}>
              <a href="https://www.coursera.org" target="_blank" rel="noreferrer" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }}>
                Open Coursera → Start Course 🎓
              </a>
              <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                Back to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes pop { 0%{transform:scale(0)} 80%{transform:scale(1.1)} 100%{transform:scale(1)} }`}</style>
    </div>
  )
}
