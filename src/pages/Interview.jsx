import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mic, MicOff, ChevronDown, ChevronUp, CheckCircle, ExternalLink, Star } from 'lucide-react'

const QUESTIONS_DB = {
  'Data Analyst': {
    fresher: [
      { q: 'Tell me about yourself and why Data Analytics.', tip: 'Background → spark of interest → 1-2 skills → what you want to build. Keep it under 90 seconds.' },
      { q: 'What is the difference between a left join and inner join?', tip: 'Inner: only matching rows. Left: all rows from left table + matches. Give a real-world example.' },
      { q: 'How would you handle missing values in a dataset?', tip: 'Drop rows, mean/median imputation, forward fill, or model-based. Explain tradeoffs for each.' },
      { q: 'What tools have you used for data analysis?', tip: 'Mention Excel, SQL, Python/Pandas, any BI tool. Even personal projects count.' },
    ],
    mid: [
      { q: 'Walk me through a data project you led end-to-end.', tip: 'Use STAR format. Focus on business impact, not just technical steps. Quantify results.' },
      { q: 'How do you handle stakeholders who disagree with your analysis?', tip: 'Show data, explain assumptions, be open to their context, find middle ground.' },
      { q: 'Explain overfitting and how you prevent it.', tip: 'Too much memorisation of training data. Fix: cross-validation, regularisation, simpler model, more data.' },
    ],
    senior: [
      { q: 'Describe how you built a data strategy for your organisation.', tip: 'Talk about data governance, KPIs definition, tooling decisions, team building.' },
      { q: 'How do you influence C-suite decisions using data?', tip: 'Translate metrics to business outcomes. Use storytelling, not just charts.' },
      { q: 'What does a mature analytics culture look like?', tip: 'Self-serve tools, data literacy across teams, trusted data, experimentation mindset.' },
    ],
  },
  'Software Developer': {
    fresher: [
      { q: 'Explain the difference between a stack and a queue.', tip: 'Stack: LIFO. Queue: FIFO. Give real examples: call stack vs printer queue.' },
      { q: 'What is OOP and what are its four pillars?', tip: 'Encapsulation, Inheritance, Polymorphism, Abstraction. One-line example each.' },
      { q: 'How do you approach debugging a code issue?', tip: 'Reproduce → isolate → check logs → rubber duck → binary search in code.' },
    ],
    mid: [
      { q: 'How do you design a REST API?', tip: 'Resources as nouns, HTTP verbs, status codes, versioning, auth, rate limiting.' },
      { q: 'Explain database indexing and when not to use it.', tip: 'Speeds reads, slows writes. Avoid on small tables, frequently updated columns.' },
    ],
    senior: [
      { q: 'How do you approach system design for 10 million users?', tip: 'Load balancer → horizontal scaling → caching → CDN → DB sharding → async queues.' },
      { q: 'How do you manage tech debt in a fast-moving team?', tip: 'Quantify it, schedule it, boy scout rule, refactor when touching adjacent code.' },
    ],
  },
  'Product Manager': {
    fresher: [
      { q: 'How do you prioritise a product backlog?', tip: 'RICE score, MoSCoW, or impact vs effort matrix. Mention stakeholder alignment.' },
      { q: 'How would you define success for a new feature?', tip: 'Define the problem → metric before launch → baseline → target → measurement plan.' },
    ],
    mid: [
      { q: 'Walk me through a product you took from 0 to launch.', tip: 'Discovery → definition → build → launch → measure. Include one failure and learnings.' },
      { q: 'How do you balance engineering capacity with product vision?', tip: 'Roadmap transparency, tech debt allocation, quarterly planning, empathy for eng.' },
    ],
    senior: [
      { q: 'How do you build and scale a product team?', tip: 'Hiring bar, culture, autonomy with accountability, OKRs, career ladders.' },
      { q: 'How have you influenced company strategy through product?', tip: 'Data-backed proposals, exec communication, long-term bets vs short-term wins.' },
    ],
  },
  'Digital Marketer': {
    fresher: [
      { q: 'What is SEO and how would you improve a website\'s ranking?', tip: 'On-page: keywords, meta tags, content quality. Off-page: backlinks. Technical: speed, mobile.' },
      { q: 'Explain the difference between organic and paid marketing.', tip: 'Organic: SEO, content, social. Paid: Google Ads, Meta Ads. Trade-offs: cost vs speed.' },
    ],
    mid: [
      { q: 'Walk me through a campaign you ran and its results.', tip: 'STAR: objective → channel → execution → results. Quantify ROI and lessons learned.' },
      { q: 'How do you allocate a ₹10 lakh marketing budget?', tip: 'Audience research → channel mix → test budget → scale winners → retention.' },
    ],
    senior: [
      { q: 'How do you build a brand from scratch in India?', tip: 'ICP definition, vernacular content, influencer tie-ups, regional platforms, earned media.' },
    ],
  },
  default: {
    fresher: [
      { q: 'Tell me about yourself.', tip: '2 minutes: background → education → skills → why this role.' },
      { q: 'Why do you want this role?', tip: 'Be specific about the company + role. Research before the interview.' },
      { q: 'What are your strengths?', tip: 'Pick 2-3, give evidence. Don\'t just list adjectives.' },
    ],
    mid: [
      { q: 'Describe a challenging project and how you handled it.', tip: 'STAR: Situation, Task, Action, Result. Quantify the outcome.' },
      { q: 'How do you manage competing priorities?', tip: 'Prioritisation framework, communication with stakeholders, trade-off decisions.' },
    ],
    senior: [
      { q: 'What is your leadership philosophy?', tip: 'Servant leadership, empowerment, clear expectations, feedback culture.' },
      { q: 'How have you grown or mentored others?', tip: 'Specific examples of people you developed and their outcomes.' },
    ],
  }
}

const LEVEL_MAP = { '0-2': 'fresher', '2-5': 'mid', '5-8': 'mid', '8-12': 'senior', '12+': 'senior' }

const SCORE_KEYWORDS = {
  strong: ['however','although','for example','specifically','increased','decreased','improved','reduced','led','built','achieved','resulted','because','therefore','first','second','additionally'],
  structure: ['situation','task','action','result','star','in summary','to conclude','in conclusion'],
}

function scoreAnswer(text, question) {
  if (!text || text.trim().length < 20) return { score: 0, feedback: 'Answer too short. Please elaborate.' }
  const words = text.trim().split(/\s+/)
  const lower = text.toLowerCase()
  let score = 0
  const tips = []

  if (words.length >= 40) { score += 20; } else { tips.push('Add more detail — aim for at least 40 words.') }
  if (words.length >= 80) score += 10
  if (SCORE_KEYWORDS.strong.some(k => lower.includes(k))) { score += 20 } else { tips.push('Use specific examples and quantify results.') }
  if (SCORE_KEYWORDS.structure.some(k => lower.includes(k))) { score += 15 } else { tips.push('Structure with STAR: Situation → Task → Action → Result.') }
  if (/\d/.test(text)) { score += 15 } else { tips.push('Add numbers — percentages, team size, revenue, time saved.') }
  if (words.length <= 200) { score += 10 } else { tips.push('Tighten your answer — under 200 words is ideal.') }
  if (lower.includes('i ') || lower.includes('my ') || lower.includes('we ')) score += 10

  score = Math.min(100, Math.max(10, score))
  const label = score >= 75 ? '🟢 Strong answer' : score >= 50 ? '🟡 Good start' : '🔴 Needs work'
  return { score, label, tips }
}

const PLATFORMS = [
  {
    name: 'Pramp (by Exponent)',
    logo: '🤝',
    type: 'Free · Peer-to-peer',
    price: 'Free',
    priceINR: '₹0',
    color: '#2563eb',
    bg: '#eff6ff',
    bestFor: 'Freshers and mid-level. Unlimited peer mock sessions.',
    highlights: ['Matched with real candidates', 'Coding + behavioural + PM tracks', 'Unlimited free sessions', 'Mutual feedback after each session'],
    link: 'https://www.pramp.com',
    recommended: false,
  },
  {
    name: 'Interviewing.io',
    logo: '🎯',
    type: 'Paid · Expert-led',
    price: '$225/session',
    priceINR: '₹18,750/session',
    color: '#7c3aed',
    bg: '#f5f3ff',
    bestFor: 'Senior professionals (5+ yrs). FAANG-level feedback.',
    highlights: ['Senior engineers from Google, Meta, Amazon', 'Anonymous until you\'re ready', 'Detailed video + written feedback', 'Real hiring bar calibration'],
    link: 'https://interviewing.io',
    recommended: true,
  },
]

export default function Interview() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('questions')
  const [activeLevel, setActiveLevel] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [practiced, setPracticed] = useState(new Set())
  const [mockInput, setMockInput] = useState('')
  const [mockHistory, setMockHistory] = useState([])
  const [mockQIdx, setMockQIdx] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [lastScore, setLastScore] = useState(null)
  const recognitionRef = useRef(null)
  const chatEndRef = useRef(null)

  const role = profile?.aspiration || 'default'
  const expSlab = profile?.experience_slab || '0-2'
  const defaultLevel = LEVEL_MAP[expSlab] || 'fresher'
  const level = activeLevel || defaultLevel
  const roleQuestions = QUESTIONS_DB[role] || QUESTIONS_DB['default']
  const questions = roleQuestions[level] || roleQuestions['fresher'] || []
  const mockQuestions = [
    ...(roleQuestions.fresher || []),
    ...(roleQuestions.mid || []),
    ...(roleQuestions.senior || []),
  ].slice(0, 6)

  useEffect(() => {
    setSpeechSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mockHistory])

  function startRecording() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-IN'
    rec.continuous = true
    rec.interimResults = true
    rec.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join(' ')
      setMockInput(transcript)
    }
    rec.onerror = () => setIsRecording(false)
    rec.onend = () => setIsRecording(false)
    rec.start()
    recognitionRef.current = rec
    setIsRecording(true)
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  function submitAnswer() {
    const text = mockInput.trim()
    if (!text) return
    const currentQ = mockQuestions[mockQIdx]
    const result = scoreAnswer(text, currentQ?.q)
    setLastScore(result)

    const nextIdx = mockQIdx + 1
    setMockHistory(h => [
      ...h,
      { role: 'user', content: text },
      {
        role: 'ai',
        score: result.score,
        label: result.label,
        tips: result.tips,
        content: nextIdx < mockQuestions.length
          ? `Score: ${result.score}/100 · ${result.label}\n\nNext question: "${mockQuestions[nextIdx].q}"`
          : `Score: ${result.score}/100 · ${result.label}\n\nYou have completed all ${mockQuestions.length} questions! Check your Readiness Score tab.`
      }
    ])
    setMockInput('')
    setLastScore(null)
    if (nextIdx < mockQuestions.length) setMockQIdx(nextIdx)
    setPracticed(p => new Set([...p, currentQ?.q]))
  }

  function markPracticed(q) { setPracticed(prev => new Set([...prev, q])) }

  const clampedReadiness = Math.min(95, Math.round(
    40 + practiced.size * 8 + (expSlab !== '0-2' ? 10 : 0)
  ))

  const levelLabels = { fresher: 'Fresher · 0–2 yrs', mid: 'Mid · 2–8 yrs', senior: 'Senior · 8+ yrs' }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '760px' }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Mic size={20} color="#db2777" /> Interview prep
        </h1>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          Role: <strong style={{ color: 'var(--gray-800)' }}>{role}</strong>
          &nbsp;·&nbsp;Level: <strong style={{ color: 'var(--gray-800)' }}>{levelLabels[level]}</strong>
          &nbsp;·&nbsp;{practiced.size} question{practiced.size !== 1 ? 's' : ''} practiced
        </p>

        <div className="tab-bar">
          {[['questions','Sample questions'],['mock','Mock interview'],['readiness','Readiness score'],['platforms','Expert platforms']].map(([id,label]) => (
            <button key={id} className={`tab-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {/* SAMPLE QUESTIONS */}
        {tab === 'questions' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {['fresher','mid','senior'].map(l => (
                <span key={l} className={`chip ${level === l ? 'active' : ''}`}
                  onClick={() => setActiveLevel(activeLevel === l ? null : l)}>
                  {l === 'fresher' ? 'Fresher · 0–2 yrs' : l === 'mid' ? 'Mid · 2–8 yrs' : 'Senior · 8+ yrs'}
                  {level === l && activeLevel === null && <span style={{ fontSize: '10px', marginLeft: '4px', opacity: .7 }}>(auto)</span>}
                </span>
              ))}
            </div>

            {questions.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No questions for this level yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {questions.map((item, i) => (
                  <div key={i} className="card" style={{ border: practiced.has(item.q) ? '1.5px solid var(--success)' : '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)', flex: 1, lineHeight: '1.4' }}>{item.q}</p>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
                        {practiced.has(item.q) && <CheckCircle size={16} color="var(--success)" />}
                        <span className={`badge ${level === 'fresher' ? 'badge-green' : level === 'mid' ? 'badge-yellow' : 'badge-red'}`}>
                          {level === 'fresher' ? 'Fresher' : level === 'mid' ? 'Mid-level' : 'Senior'}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => setExpanded(expanded === i ? null : i)} className="btn btn-ghost btn-sm" style={{ marginBottom: '8px' }}>
                      {expanded === i ? <><ChevronUp size={13} /> Hide tip</> : <><ChevronDown size={13} /> Show answer tip</>}
                    </button>
                    {expanded === i && (
                      <div style={{ background: 'var(--brand-light)', borderRadius: 'var(--radius-md)', padding: '.75rem', marginBottom: '8px', fontSize: '13px', color: 'var(--brand)', lineHeight: '1.6' }}>
                        💡 <strong>Tip:</strong> {item.tip}
                      </div>
                    )}
                    <button onClick={() => { markPracticed(item.q); setTab('mock') }}
                      className={`btn btn-sm ${practiced.has(item.q) ? 'btn-outline' : 'btn-primary'}`}>
                      {practiced.has(item.q) ? '✓ Practiced' : '🎤 Practice this question'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOCK INTERVIEW with speech */}
        {tab === 'mock' && (
          <div>
            <div className="card" style={{ background: 'var(--brand-light)', border: '1px solid var(--brand)', marginBottom: '1rem' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand)', marginBottom: '4px' }}>
                AI mock interview · {role} · {levelLabels[level]}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--brand)' }}>
                {speechSupported
                  ? '🎤 Click the mic to speak your answer — speech-to-text is active · or type below'
                  : 'Type your answer below · Each submission is scored on structure, depth, and specifics'}
              </p>
            </div>

            {/* Chat history */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1rem', minHeight: '200px', maxHeight: '340px', overflowY: 'auto', padding: '4px 0' }}>
              {mockHistory.length === 0 && (
                <div style={{ background: 'var(--gray-100)', borderRadius: '4px 14px 14px 14px', padding: '10px 14px', fontSize: '13px', maxWidth: '85%' }}>
                  <p style={{ fontWeight: '600', color: 'var(--brand)', marginBottom: '4px', fontSize: '12px' }}>Interviewer</p>
                  <p>{mockQuestions[0]?.q || 'Tell me about yourself.'}</p>
                </div>
              )}
              {mockHistory.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    background: m.role === 'user' ? 'var(--brand)' : 'var(--gray-100)',
                    borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                    padding: '10px 14px', fontSize: '13px', maxWidth: '85%',
                    color: m.role === 'user' ? '#fff' : 'var(--gray-900)',
                  }}>
                    {m.role === 'ai' && <p style={{ fontWeight: '600', color: 'var(--brand)', marginBottom: '4px', fontSize: '12px' }}>Interviewer</p>}
                    <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{m.content}</p>
                    {m.role === 'ai' && m.tips?.length > 0 && (
                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--gray-200)' }}>
                        {m.tips.map((t, ti) => (
                          <p key={ti} style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '3px' }}>• {t}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input area with mic */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <textarea value={mockInput} onChange={e => setMockInput(e.target.value)}
                  rows={3} placeholder={isRecording ? '🎙 Listening… speak your answer' : 'Type your answer or click mic to speak…'}
                  style={{ flex: 1, resize: 'none', fontSize: '13px', padding: '10px', lineHeight: '1.5', border: isRecording ? '1.5px solid var(--danger)' : '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-md)', outline: 'none' }}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) submitAnswer() }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {speechSupported && (
                    <button onClick={isRecording ? stopRecording : startRecording}
                      style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRecording ? 'var(--danger)' : 'var(--gray-100)', transition: 'all .2s', animation: isRecording ? 'pulse 1.5s infinite' : 'none' }}
                      title={isRecording ? 'Stop recording' : 'Start speaking'}>
                      {isRecording ? <MicOff size={18} color="#fff" /> : <Mic size={18} color="var(--gray-600)" />}
                    </button>
                  )}
                  <button onClick={submitAnswer} disabled={!mockInput.trim()}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: mockInput.trim() ? 'var(--brand)' : 'var(--gray-200)', color: '#fff', fontSize: '18px' }}>
                    ↑
                  </button>
                </div>
              </div>
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--danger)', fontWeight: '500' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s infinite' }} />
                  Recording in English (India)… click mic again to stop
                </div>
              )}
              <p style={{ fontSize: '11px', color: 'var(--gray-400)' }}>⌘+Enter to submit · Answers are scored on length, structure, specifics, and numbers</p>
            </div>
          </div>
        )}

        {/* READINESS SCORE */}
        {tab === 'readiness' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: '700', color: clampedReadiness >= 70 ? 'var(--success)' : clampedReadiness >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{clampedReadiness}%</p>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>Overall readiness</p>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px' }}>{clampedReadiness >= 75 ? 'Interview ready!' : clampedReadiness >= 55 ? 'Almost there' : 'Keep practising'}</p>
              </div>
              <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--brand)' }}>{practiced.size}/{questions.length}</p>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>Questions practiced</p>
                <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px' }}>+8% readiness each</p>
              </div>
            </div>

            <div className="card">
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem' }}>Readiness breakdown</p>
              {[
                { label: 'Technical knowledge',  score: Math.min(100, 50 + practiced.size * 8) },
                { label: 'Communication clarity', score: Math.min(100, 35 + practiced.size * 6) },
                { label: 'Behavioural / STAR',   score: Math.min(100, 30 + practiced.size * 7) },
                { label: 'Resume confidence',    score: Math.min(100, 60 + practiced.size * 4) },
                { label: 'Company research',     score: Math.min(100, 25 + practiced.size * 5) },
              ].map((area, i) => {
                const color = area.score >= 70 ? 'var(--success)' : area.score >= 50 ? 'var(--warning)' : 'var(--danger)'
                return (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{area.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color }}>{area.score}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--gray-200)', borderRadius: '3px' }}>
                      <div style={{ width: `${area.score}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width .5s' }} />
                    </div>
                  </div>
                )
              })}
              {clampedReadiness < 75 && (
                <div style={{ padding: '10px 12px', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', marginTop: '.5rem' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--warning)', marginBottom: '3px' }}>Focus area</p>
                  <p style={{ fontSize: '12px', color: 'var(--warning)', lineHeight: '1.5' }}>
                    {practiced.size < 3
                      ? 'Practice at least 3 more questions to boost your score above 75%.'
                      : 'Work on STAR-format answers — they make the biggest difference in final rounds.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EXPERT PLATFORMS — revenue section */}
        {tab === 'platforms' && (
          <div>
            <div style={{ background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--brand)', marginBottom: '4px' }}>Ready to go beyond AI practice?</p>
              <p style={{ fontSize: '13px', color: 'var(--brand)', lineHeight: '1.6' }}>
                Our in-app mock interview gives you a readiness score. When you're ready for real expert feedback —
                especially for senior roles and FAANG-level prep — these two platforms are the best in market.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {PLATFORMS.map(p => (
                <div key={p.name} className="card" style={{ border: p.recommended ? '2px solid var(--brand)' : '1px solid var(--gray-200)', position: 'relative' }}>
                  {p.recommended && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--brand)', color: '#fff', fontSize: '11px', fontWeight: '600', padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                      ⭐ Recommended for {expSlab === '0-2' ? 'after 5+ mock sessions' : 'your experience level'}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', marginTop: p.recommended ? '8px' : 0 }}>
                    <span style={{ fontSize: '28px' }}>{p.logo}</span>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</p>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: p.bg, color: p.color, fontWeight: '500' }}>{p.type}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: p.cost === 0 ? 'var(--success)' : 'var(--warning)' }}>{p.priceINR}</span>
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{p.price}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '10px', lineHeight: '1.5' }}>{p.bestFor}</p>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '12px' }}>
                    {p.highlights.map((h, i) => (
                      <li key={i} style={{ fontSize: '12px', color: 'var(--gray-600)', padding: '3px 0', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                        <CheckCircle size={12} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} /> {h}
                      </li>
                    ))}
                  </ul>
                  <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    Visit {p.name.split(' ')[0]} <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>

            {/* Revenue / upgrade hook */}
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #7c3aed)', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', color: '#fff' }}>
              <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '6px' }}>🚀 Career Saathi Premium Interview Bundle</p>
              <p style={{ fontSize: '13px', opacity: .9, lineHeight: '1.6', marginBottom: '12px' }}>
                Get 3 expert sessions on Pramp + 1 Interviewing.io session pre-booked + your personalised question bank for your role and level. All managed from here.
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '22px', fontWeight: '700' }}>₹4,999</span>
                  <span style={{ fontSize: '12px', opacity: .7, marginLeft: '8px', textDecoration: 'line-through' }}>₹8,000</span>
                </div>
                <button onClick={() => alert('Premium bundle coming soon! You will be notified.')}
                  style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: '#fff', color: 'var(--brand)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
                  Get Premium Bundle →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>
    </div>
  )
}
