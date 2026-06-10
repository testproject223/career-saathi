import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { UserCheck, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react'

function generateHeadline(profile) {
  if (!profile?.aspiration) return ''
  const exp = profile.experience === 'fresher' ? 'Fresher' : `${profile.experience} yrs exp`
  const edu = profile.education?.toUpperCase() || ''
  return `Aspiring ${profile.aspiration} | ${edu} Graduate | ${profile.city || 'India'} | Open to Work`
}

function generateAbout(profile) {
  if (!profile?.aspiration) return ''
  const skills = (profile.skills || []).join(', ')
  const exp = profile.experience === 'fresher' ? 'a recent graduate' : `a professional with ${profile.experience} years of experience`
  return `I am ${exp} passionate about building a career in ${profile.aspiration}.

${skills ? `My core skills include ${skills}.` : ''} I am actively seeking opportunities to apply my knowledge and grow professionally in a dynamic organisation.

${profile.city ? `Based in ${profile.city}, India.` : ''} I am open to ${profile.job_type === 'any' ? 'all work arrangements' : profile.job_type + ' roles'}.

Let's connect if you're looking for a motivated ${profile.aspiration} who is eager to learn and contribute!`
}

function generateSkills(profile) {
  const base = profile?.skills || []
  const aspirationSkills = {
    'Data Analyst': ['Data Analysis', 'Microsoft Excel', 'SQL', 'Python', 'Data Visualization', 'Business Intelligence', 'Problem Solving', 'Analytical Thinking'],
    'Software Developer': ['Software Development', 'Programming', 'Problem Solving', 'Agile', 'Git', 'Code Review', 'Object-Oriented Programming'],
    'Digital Marketer': ['Digital Marketing', 'SEO', 'Social Media Marketing', 'Content Strategy', 'Google Analytics', 'Campaign Management'],
    'Business Analyst': ['Business Analysis', 'Requirements Gathering', 'Process Improvement', 'SQL', 'Excel', 'Stakeholder Management'],
    'default': ['Communication', 'Teamwork', 'Problem Solving', 'Microsoft Office', 'Time Management'],
  }
  const extras = aspirationSkills[profile?.aspiration] || aspirationSkills['default']
  return [...new Set([...base, ...extras])].slice(0, 10)
}

function generateFeatured(profile) {
  return [
    `📌 Currently studying: ${profile?.aspiration || 'my field'} — actively building skills in ${(profile?.skills || []).slice(0, 2).join(' & ') || 'my area'}`,
    `🎯 Open to: ${profile?.aspiration} roles in ${profile?.city || 'India'} (${profile?.job_type === 'any' ? 'remote/hybrid/onsite' : profile?.job_type})`,
    `📧 Reach me: ${profile?.email || 'via LinkedIn message'}`,
  ]
}

export default function LinkedInPage() {
  const { profile } = useAuth()
  const [copied, setCopied] = useState({})
  const [customised, setCustomised] = useState({
    headline: generateHeadline(profile),
    about: generateAbout(profile),
  })

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  function regenerate() {
    setCustomised({
      headline: generateHeadline(profile),
      about: generateAbout(profile),
    })
  }

  const skills = generateSkills(profile)
  const featured = generateFeatured(profile)

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <UserCheck size={20} color="#0a66c2" /> LinkedIn Profile Builder
            </h1>
            <p className="text-muted">Copy each section and paste directly into your LinkedIn profile</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={regenerate} className="btn btn-outline btn-sm"><RefreshCw size={14} /> Regenerate</button>
            <a href="https://www.linkedin.com/in/" target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: '#0a66c2', color: '#fff', borderColor: '#0a66c2' }}>
              Open LinkedIn <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Connect banner */}
        <div style={{ background: '#e8f0fe', border: '1px solid #b3c9f7', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#0a66c2' }}>🔗 Connect your LinkedIn account</p>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '2px' }}>Import your existing profile to auto-fill and enhance your content</p>
          </div>
          <a href="https://www.linkedin.com/oauth/v2/authorization?response_type=code&scope=r_liteprofile%20r_emailaddress" target="_blank" rel="noreferrer"
            className="btn btn-sm" style={{ background: '#0a66c2', color: '#fff', borderColor: '#0a66c2', whiteSpace: 'nowrap' }}>
            Connect LinkedIn →
          </a>
        </div>

        {/* Step by step guide */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', padding: '1rem 1.25rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--gray-600)', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '500', color: 'var(--gray-800)' }}>How to use:</span>
          <span>1. Click Copy on each section</span>
          <span>→</span>
          <span>2. Open LinkedIn Edit Profile</span>
          <span>→</span>
          <span>3. Paste into each field</span>
          <span>→</span>
          <span>4. Save on LinkedIn</span>
        </div>

        {/* Headline */}
        <LinkedInCard
          step="1"
          title="Headline"
          hint="This appears under your name — most important field for search visibility"
          content={customised.headline}
          onEdit={v => setCustomised(p => ({ ...p, headline: v }))}
          onCopy={() => copy('headline', customised.headline)}
          copied={copied.headline}
          singleLine
        />

        {/* About */}
        <LinkedInCard
          step="2"
          title="About (Summary)"
          hint="Your 'About' section — shown on your profile. 2,600 character limit."
          content={customised.about}
          onEdit={v => setCustomised(p => ({ ...p, about: v }))}
          onCopy={() => copy('about', customised.about)}
          copied={copied.about}
        />

        {/* Skills */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0a66c2', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Skills to add</h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginLeft: '30px', marginTop: '2px' }}>Add each skill individually in LinkedIn's Skills section</p>
            </div>
            <button onClick={() => copy('skills', skills.join('\n'))} className="btn btn-outline btn-sm">
              {copied.skills ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy all</>}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {skills.map(s => (
              <span key={s} onClick={() => copy(s, s)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', background: copied[s] ? '#f0fdf4' : '#e8f0fe', color: copied[s] ? 'var(--success)' : '#0a66c2', cursor: 'pointer', border: `1px solid ${copied[s] ? '#bbf7d0' : '#b3c9f7'}`, transition: 'all .15s' }}>
                {copied[s] ? <Check size={11} /> : <Copy size={11} />} {s}
              </span>
            ))}
          </div>
        </div>

        {/* Featured / Contact */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.75rem' }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0a66c2', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>4</span>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Open to Work + Contact info</h3>
              <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '2px' }}>Add to your Featured section or as LinkedIn posts</p>
            </div>
          </div>
          {featured.map((line, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.625rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', marginBottom: '6px', gap: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{line}</p>
              <button onClick={() => copy('feat' + i, line)} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                {copied['feat' + i] ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              </button>
            </div>
          ))}
        </div>

        {/* Profile photo tip */}
        <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', fontSize: '13px', color: 'var(--gray-700)' }}>
          <p style={{ fontWeight: '600', marginBottom: '4px' }}>📸 Profile photo tip</p>
          <p>A professional headshot increases profile views by 14x. Use a plain background, good lighting, and business casual attire. Free tool: <a href="https://www.remove.bg" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>remove.bg</a> to clean up background.</p>
        </div>
      </div>
    </div>
  )
}

function LinkedInCard({ step, title, hint, content, onEdit, onCopy, copied, singleLine }) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0a66c2', color: '#fff', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</span>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '600' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '1px' }}>{hint}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <button onClick={() => setEditing(!editing)} className="btn btn-ghost btn-sm">{editing ? 'Done' : 'Edit'}</button>
          <button onClick={onCopy} className="btn btn-primary btn-sm">
            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
        </div>
      </div>
      {editing
        ? singleLine
          ? <input value={content} onChange={e => onEdit(e.target.value)} style={{ fontFamily: 'inherit' }} />
          : <textarea value={content} onChange={e => onEdit(e.target.value)} rows={8} style={{ fontFamily: 'inherit', resize: 'vertical' }} />
        : <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '.875rem 1rem', fontSize: '14px', color: 'var(--gray-700)', lineHeight: '1.7', whiteSpace: 'pre-wrap', cursor: 'text' }} onClick={() => setEditing(true)}>
            {content || <span style={{ color: 'var(--gray-300)' }}>Click Edit to customise…</span>}
          </div>
      }
      {!singleLine && content && <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '6px', textAlign: 'right' }}>{content.length} / 2600 chars</p>}
    </div>
  )
}
