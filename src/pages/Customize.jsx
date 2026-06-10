import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Sparkles, Send, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

const QUICK_PROMPTS = [
  { label: 'Update profile', text: 'Update my profile — I have completed BCA and want to move into backend development in Bangalore' },
  { label: 'Rebuild resume', text: 'Rebuild my resume for a data analyst role with ATS keywords for 2025, 1 page format' },
  { label: 'Free courses only', text: 'Show me only free courses from YouTube and NPTEL for learning Python and SQL for data analysis' },
  { label: 'Courses under ₹3k', text: 'Show me best courses under ₹3,000 total from Coursera and Great Learning for my career goal' },
  { label: 'Compare paths', text: 'Compare career paths between product management and data analytics based on my background and suggest which suits me better' },
]

export default function Customize() {
  const { profile, updateProfile } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const used = profile?.free_prompts_used || 0
  const limit = profile?.free_prompts_limit || 5
  const remaining = limit - used

  async function runPrompt() {
    if (!prompt.trim()) return
    if (remaining <= 0) { setError('No free prompts remaining. Upgrade to Pro for unlimited prompts.'); return }
    setLoading(true); setError(''); setResult(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('customize', {
        body: { prompt, profile }
      })

      if (fnError) throw fnError

      await updateProfile({ free_prompts_used: used + 1 })

      await supabase.from('prompt_history').insert({
        user_id: profile.id,
        prompt,
        output: data,
        tokens_used: data.tokens_used || 0
      })

      setResult(data)
    } catch (e) {
      setError(e.message || 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '720px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--brand)" /> Customize
          </h1>
          <p className="text-muted">Enter any prompt to get personalised career advice, resume updates, or course recommendations.</p>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-700)' }}>Your prompt</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < remaining ? 'var(--success)' : 'var(--gray-300)', transition: 'background .3s' }} />
              ))}
              <span style={{ fontSize: '12px', color: 'var(--gray-500)', marginLeft: '6px' }}>{remaining} free prompt{remaining !== 1 ? 's' : ''} left</span>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder="e.g. I'm a B.Com graduate from Jaipur interested in becoming a data analyst. Show me a learning path with free resources and update my resume accordingly…"
            style={{ resize: 'vertical', minHeight: '100px' }}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) runPrompt() }}
          />

          {error && <p style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '.5rem' }}>{error}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '.75rem' }}>
            <button className="btn btn-primary" onClick={runPrompt} disabled={loading || !prompt.trim() || remaining <= 0}>
              {loading ? <><span className="spinner" style={{ borderTopColor: '#fff', width: '16px', height: '16px' }} /> Analysing…</> : <><Send size={14} /> Analyse</>}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '8px', fontWeight: '500' }}>QUICK-FILL</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {QUICK_PROMPTS.map(q => (
              <span key={q.label} className="chip" onClick={() => setPrompt(q.text)}>{q.label}</span>
            ))}
          </div>
        </div>

        {remaining <= 0 && (
          <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1rem', textAlign: 'center' }}>
            <p style={{ fontWeight: '600', color: 'var(--warning)', fontSize: '14px' }}>All free prompts used</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '4px' }}>Upgrade to Pro for unlimited prompts — ₹199/month</p>
            <button className="btn btn-sm" style={{ background: 'var(--warning)', color: '#fff', borderColor: 'var(--warning)', marginTop: '.75rem' }}>Upgrade to Pro</button>
          </div>
        )}

        {result && <CustomizeResult result={result} />}
      </div>
    </div>
  )
}

function CustomizeResult({ result }) {
  const [tab, setTab] = useState('start')
  const tabs = [
    { id: 'start', label: 'Where to start' },
    { id: 'courses', label: 'Courses' },
    { id: 'resume', label: 'Resume' },
    { id: 'linkedin', label: 'LinkedIn' },
  ]

  return (
    <div className="card">
      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t.id} className={`tab-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {tab === 'start' && (
        <div>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>{result.roadmap || result.start || 'See your personalised roadmap above.'}</p>
          {result.skills_gap && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gray-500)', marginBottom: '6px' }}>SKILLS TO BUILD</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.skills_gap.map(s => <span key={s} className="badge badge-blue">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {(result.courses || []).map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-900)' }}>{c.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>{c.platform} · {c.duration}</p>
              </div>
              <span className={`badge ${c.cost === 0 ? 'badge-green' : 'badge-yellow'}`}>
                {c.cost === 0 ? 'Free' : `₹${c.cost}`}
              </span>
            </div>
          ))}
          {(!result.courses || result.courses.length === 0) && <p className="text-muted">No course recommendations yet. Run a prompt first.</p>}
        </div>
      )}

      {tab === 'resume' && (
        <div>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--gray-700)', whiteSpace: 'pre-wrap' }}>{result.resume_summary || 'Resume insights will appear here after your prompt.'}</p>
          {result.ats_keywords && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gray-500)', marginBottom: '6px' }}>ATS KEYWORDS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.ats_keywords.map(k => <span key={k} className="badge badge-gray">{k}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'linkedin' && (
        <div>
          {result.linkedin_headline && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gray-500)', marginBottom: '4px' }}>HEADLINE</p>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--gray-900)', padding: '.75rem', background: 'var(--brand-light)', borderRadius: 'var(--radius-md)' }}>{result.linkedin_headline}</p>
            </div>
          )}
          {result.linkedin_about && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--gray-500)', marginBottom: '4px' }}>ABOUT SECTION</p>
              <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--gray-700)', whiteSpace: 'pre-wrap', padding: '.75rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>{result.linkedin_about}</p>
            </div>
          )}
          {!result.linkedin_headline && <p className="text-muted">LinkedIn copy will appear here after your prompt.</p>}
        </div>
      )}
    </div>
  )
}
