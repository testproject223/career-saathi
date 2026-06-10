import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { FileText, Upload, Download, Plus, Trash2, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'

const EMPTY_RESUME = {
  name: '', email: '', phone: '', city: '', linkedin: '', github: '',
  objective: '',
  education: [{ degree: '', institution: '', year: '', percentage: '' }],
  experience: [{ title: '', company: '', duration: '', description: '' }],
  skills: '',
  projects: [{ name: '', description: '', tech: '' }],
  certifications: '',
}

export default function Resume() {
  const { profile, user } = useAuth()
  const [mode, setMode] = useState('choose') // choose | build | upload | preview
  const [form, setForm] = useState({
    ...EMPTY_RESUME,
    name: profile?.name || '',
    email: profile?.email || '',
    city: profile?.city || '',
    skills: (profile?.skills || []).join(', '),
  })
  const [uploadedFile, setUploadedFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const setArr = (key, idx, field, val) => setForm(f => ({
    ...f,
    [key]: f[key].map((item, i) => i === idx ? { ...item, [field]: val } : item)
  }))
  const addArr = key => setForm(f => ({
    ...f,
    [key]: [...f[key], key === 'education'
      ? { degree: '', institution: '', year: '', percentage: '' }
      : key === 'experience'
        ? { title: '', company: '', duration: '', description: '' }
        : { name: '', description: '', tech: '' }]
  }))
  const removeArr = (key, idx) => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }))

  async function saveResume() {
    setSaving(true)
    await supabase.from('resumes').upsert({
      user_id: user.id,
      content: form,
      target_role: profile?.aspiration || '',
      version: 1,
      is_active: true
    }, { onConflict: 'user_id' })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setMode('preview')
  }

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadedFile(file)
    setMode('upload')
  }

  function printResume() {
    window.print()
  }

  if (mode === 'choose') return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '700px' }}>
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.5rem' }}>
          <FileText size={20} color="var(--brand)" /> Resume Builder
        </h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Build a new resume from scratch or upload your existing one</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', transition: 'transform .15s, box-shadow .15s' }}
            onClick={() => setMode('build')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <FileText size={24} color="var(--brand)" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '.5rem' }}>Build from scratch</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.5' }}>Fill in your details and we'll create a clean, ATS-friendly resume</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>Start building →</button>
          </div>
          <div className="card" style={{ cursor: 'pointer', textAlign: 'center', padding: '2rem', transition: 'transform .15s, box-shadow .15s' }}
            onClick={() => fileRef.current.click()}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Upload size={24} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '.5rem' }}>Upload existing resume</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.5' }}>Upload your PDF or Word resume to store and share it</p>
            <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>Upload file →</button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>
    </div>
  )

  if (mode === 'upload') return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '600px' }}>
        <button onClick={() => setMode('choose')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>← Back</button>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📄</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '.5rem' }}>Resume uploaded!</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '.25rem' }}>{uploadedFile?.name}</p>
          <p style={{ color: 'var(--gray-400)', fontSize: '12px', marginBottom: '1.5rem' }}>{(uploadedFile?.size / 1024).toFixed(1)} KB</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={() => fileRef.current.click()}>Upload different file</button>
            <button className="btn btn-primary btn-sm" onClick={() => setMode('build')}>Build new resume instead</button>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--brand-light)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--brand)' }}>
            💡 Tip: Use the <strong>Customize</strong> tab to get AI feedback on your uploaded resume
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileUpload} />
      </div>
    </div>
  )

  if (mode === 'preview') return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setMode('build')} className="btn btn-outline btn-sm">← Edit</button>
          <button onClick={printResume} className="btn btn-primary btn-sm"><Download size={14} /> Download / Print PDF</button>
          <span style={{ fontSize: '12px', color: 'var(--success)', marginLeft: '8px' }}>✓ Saved to your account</span>
        </div>
        <ResumePreview form={form} />
      </div>
    </div>
  )

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('choose')} className="btn btn-ghost btn-sm">← Back</button>
          <h1 style={{ fontSize: '18px', fontWeight: '600', flex: 1 }}>Build your resume</h1>
          <button onClick={() => setMode('preview')} className="btn btn-outline btn-sm"><Eye size={14} /> Preview</button>
          <button onClick={saveResume} className="btn btn-primary btn-sm" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#fff' }} /> : saved ? '✓ Saved!' : <><Download size={14} /> Save</>}
          </button>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information">
          <div className="form-row">
            <div className="form-group"><label>Full name *</label><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Priya Sharma" /></div>
            <div className="form-group"><label>Email *</label><input value={form.email} onChange={e => set('email', e.target.value)} placeholder="priya@email.com" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" /></div>
            <div className="form-group"><label>City</label><input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Pune, Maharashtra" /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label>LinkedIn URL</label><input value={form.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="linkedin.com/in/yourname" /></div>
            <div className="form-group"><label>GitHub / Portfolio</label><input value={form.github} onChange={e => set('github', e.target.value)} placeholder="github.com/yourname" /></div>
          </div>
        </Section>

        {/* Objective */}
        <Section title="Career Objective">
          <textarea value={form.objective} onChange={e => set('objective', e.target.value)} rows={3}
            placeholder={`e.g. Motivated B.Com graduate seeking a Data Analyst role where I can apply my Excel and SQL skills to drive business insights…`} />
        </Section>

        {/* Education */}
        <Section title="Education" onAdd={() => addArr('education')}>
          {form.education.map((ed, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '.75rem', position: 'relative' }}>
              {form.education.length > 1 && <button onClick={() => removeArr('education', i)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={14} /></button>}
              <div className="form-row">
                <div className="form-group"><label>Degree / Class</label><input value={ed.degree} onChange={e => setArr('education', i, 'degree', e.target.value)} placeholder="B.Com / 12th Science / B.Tech CSE" /></div>
                <div className="form-group"><label>Institution</label><input value={ed.institution} onChange={e => setArr('education', i, 'institution', e.target.value)} placeholder="Pune University" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Year</label><input value={ed.year} onChange={e => setArr('education', i, 'year', e.target.value)} placeholder="2022" /></div>
                <div className="form-group"><label>Percentage / CGPA</label><input value={ed.percentage} onChange={e => setArr('education', i, 'percentage', e.target.value)} placeholder="78% / 7.5 CGPA" /></div>
              </div>
            </div>
          ))}
        </Section>

        {/* Experience */}
        <Section title="Work Experience" onAdd={() => addArr('experience')}>
          {form.experience.map((ex, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '.75rem', position: 'relative' }}>
              {form.experience.length > 1 && <button onClick={() => removeArr('experience', i)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={14} /></button>}
              <div className="form-row">
                <div className="form-group"><label>Job title</label><input value={ex.title} onChange={e => setArr('experience', i, 'title', e.target.value)} placeholder="Data Analyst Intern" /></div>
                <div className="form-group"><label>Company</label><input value={ex.company} onChange={e => setArr('experience', i, 'company', e.target.value)} placeholder="ABC Corp" /></div>
              </div>
              <div className="form-group"><label>Duration</label><input value={ex.duration} onChange={e => setArr('experience', i, 'duration', e.target.value)} placeholder="Jun 2023 – Aug 2023" /></div>
              <div className="form-group"><label>Description (use bullet points)</label>
                <textarea value={ex.description} onChange={e => setArr('experience', i, 'description', e.target.value)} rows={3} placeholder="• Analysed sales data using Excel and created monthly dashboards&#10;• Reduced report generation time by 40%&#10;• Collaborated with marketing team on campaign analysis" />
              </div>
            </div>
          ))}
          <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '4px' }}>Fresher? Leave blank or add internships / college projects</p>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <div className="form-group">
            <label>Technical skills (comma separated)</label>
            <input value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="Excel, SQL, Python, Tally, Power BI, Tableau" />
          </div>
        </Section>

        {/* Projects */}
        <Section title="Projects" onAdd={() => addArr('projects')}>
          {form.projects.map((pr, i) => (
            <div key={i} style={{ padding: '1rem', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', marginBottom: '.75rem', position: 'relative' }}>
              {form.projects.length > 1 && <button onClick={() => removeArr('projects', i)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={14} /></button>}
              <div className="form-group"><label>Project name</label><input value={pr.name} onChange={e => setArr('projects', i, 'name', e.target.value)} placeholder="Sales Dashboard using Power BI" /></div>
              <div className="form-group"><label>Description</label><textarea value={pr.description} onChange={e => setArr('projects', i, 'description', e.target.value)} rows={2} placeholder="Built an interactive sales dashboard that visualised ₹2Cr monthly revenue data across 5 regions" /></div>
              <div className="form-group"><label>Technologies used</label><input value={pr.tech} onChange={e => setArr('projects', i, 'tech', e.target.value)} placeholder="Power BI, Excel, SQL" /></div>
            </div>
          ))}
        </Section>

        {/* Certifications */}
        <Section title="Certifications & Achievements">
          <textarea value={form.certifications} onChange={e => set('certifications', e.target.value)} rows={3}
            placeholder="• Google Data Analytics Certificate — Coursera (2024)&#10;• SQL for Data Science — NPTEL (2023)&#10;• Best Student Award — Pune University (2022)" />
        </Section>

        <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button onClick={() => setMode('preview')} className="btn btn-outline"><Eye size={16} /> Preview resume</button>
          <button onClick={saveResume} className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> : saved ? '✓ Saved!' : <><Download size={16} /> Save & Preview</>}
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, onAdd }) {
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--gray-800)' }}>{title}</h3>
        {onAdd && <button onClick={onAdd} className="btn btn-ghost btn-sm" style={{ color: 'var(--brand)' }}><Plus size={14} /> Add</button>}
      </div>
      {children}
    </div>
  )
}

function ResumePreview({ form }) {
  return (
    <div id="resume-print" style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', fontFamily: 'Georgia, serif', maxWidth: '720px', margin: '0 auto' }}>
      <style>{`@media print { body * { visibility: hidden } #resume-print, #resume-print * { visibility: visible } #resume-print { position: absolute; left: 0; top: 0; width: 100%; padding: 2rem; } }`}</style>

      {/* Header */}
      <div style={{ borderBottom: '2px solid var(--gray-900)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--gray-900)', marginBottom: '4px' }}>{form.name || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: 'var(--gray-600)' }}>
          {form.email && <span>✉ {form.email}</span>}
          {form.phone && <span>📞 {form.phone}</span>}
          {form.city && <span>📍 {form.city}</span>}
          {form.linkedin && <span>🔗 {form.linkedin}</span>}
          {form.github && <span>💻 {form.github}</span>}
        </div>
      </div>

      {/* Objective */}
      {form.objective && <ResumeSection title="CAREER OBJECTIVE"><p style={{ fontSize: '13px', lineHeight: '1.7', color: 'var(--gray-700)' }}>{form.objective}</p></ResumeSection>}

      {/* Education */}
      {form.education.some(e => e.degree) && (
        <ResumeSection title="EDUCATION">
          {form.education.filter(e => e.degree).map((ed, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
              <div><p style={{ fontSize: '14px', fontWeight: '600' }}>{ed.degree}</p><p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{ed.institution}</p></div>
              <div style={{ textAlign: 'right' }}><p style={{ fontSize: '13px' }}>{ed.year}</p>{ed.percentage && <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{ed.percentage}</p>}</div>
            </div>
          ))}
        </ResumeSection>
      )}

      {/* Experience */}
      {form.experience.some(e => e.title) && (
        <ResumeSection title="WORK EXPERIENCE">
          {form.experience.filter(e => e.title).map((ex, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '14px', fontWeight: '600' }}>{ex.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{ex.duration}</p>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '4px' }}>{ex.company}</p>
              <p style={{ fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{ex.description}</p>
            </div>
          ))}
        </ResumeSection>
      )}

      {/* Skills */}
      {form.skills && <ResumeSection title="SKILLS"><p style={{ fontSize: '13px', lineHeight: '1.7' }}>{form.skills}</p></ResumeSection>}

      {/* Projects */}
      {form.projects.some(p => p.name) && (
        <ResumeSection title="PROJECTS">
          {form.projects.filter(p => p.name).map((pr, i) => (
            <div key={i} style={{ marginBottom: '.75rem' }}>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>{pr.name} {pr.tech && <span style={{ fontWeight: '400', color: 'var(--gray-500)', fontSize: '12px' }}>| {pr.tech}</span>}</p>
              <p style={{ fontSize: '13px', color: 'var(--gray-700)', lineHeight: '1.6' }}>{pr.description}</p>
            </div>
          ))}
        </ResumeSection>
      )}

      {/* Certifications */}
      {form.certifications && <ResumeSection title="CERTIFICATIONS & ACHIEVEMENTS"><p style={{ fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{form.certifications}</p></ResumeSection>}
    </div>
  )
}

function ResumeSection({ title, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h2 style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '.1em', color: 'var(--gray-900)', borderBottom: '1px solid var(--gray-300)', paddingBottom: '4px', marginBottom: '8px' }}>{title}</h2>
      {children}
    </div>
  )
}
