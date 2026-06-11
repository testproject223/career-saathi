import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, Plus, Trash2, Upload, CheckCircle, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EXP_SLABS } from '../lib/persona'
import CitySelect from '../components/ui/CitySelect'

const STEPS = ['Basics + Resume', 'Career goal', 'Skills', 'Review']

const SKILLS_OPTIONS = [
  'Excel','SQL','Python','Tally','Java','C++','React','Node.js',
  'Digital Marketing','Content Writing','Accounting','Data Entry',
  'Photoshop','AutoCAD','Spoken English','Power BI','Tableau','R',
  'Machine Learning','HTML/CSS','Product Management','Agile',
  'Leadership','Stakeholder Management','Figma','Financial Analysis',
  'Project Management','DevOps','Cybersecurity',
]

const GOAL_OPTIONS = [
  'Software Developer','Data Analyst','Data Scientist','Web Developer',
  'Product Manager','DevOps Engineer','UI/UX Designer',
  'Accountant','Financial Analyst','CA / CMA','Banking Professional','Tax Consultant',
  'Marketing Manager','Digital Marketer','HR Manager','Business Analyst',
  'Content Writer','Graphic Designer','Civil Engineer',
  'Teacher / Educator','Government Job (SSC/UPSC)',
]

const PRIMARY_GOALS = [
  { value:'find_job',        icon:'💼', label:'Find a job',          sub:'Search roles, apply now' },
  { value:'resume_linkedin', icon:'📄', label:'Resume + LinkedIn',   sub:'ATS resume + profile copy' },
  { value:'learn_apply',     icon:'📚', label:'Learn and apply',     sub:'Courses + projects + jobs' },
  { value:'interview_prep',  icon:'🎤', label:'Interview prep',      sub:'Mock Q&A + readiness score' },
]

const EMPTY_PROJECT = { name:'', role:'', description:'', tech:'', duration:'', link:'' }

export default function Onboarding() {
  const { updateProfile, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  const [form, setForm] = useState({
    name: '', city: '', education: '', stream: '',
    experience_slab: '0-2', last_ctc_lpa: '', sector: 'private',
    job_type: 'any', aspiration: '', primary_goal: 'find_job',
    skills: [], linkedin_url: '', linkedin_headline: '', linkedin_about: '',
    projects: [{ ...EMPTY_PROJECT }],
    resume_uploaded: false, resume_url: '',
  })

  const [resumeFileName, setResumeFileName] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)
  const [extractedData, setExtractedData] = useState(null) // from resume AI parse

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const toggleSkill = s => setForm(f => ({
    ...f,
    skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }))

  const setProject = (idx, field, val) => setForm(f => ({
    ...f, projects: f.projects.map((p, i) => i === idx ? { ...p, [field]: val } : p)
  }))
  const addProject = () => setForm(f => ({ ...f, projects: [...f.projects, { ...EMPTY_PROJECT }] }))
  const removeProject = idx => setForm(f => ({ ...f, projects: f.projects.filter((_, i) => i !== idx) }))

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file || !user) return
    setUploadingResume(true)
    const path = `${user.id}/resume-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('resumes').upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(path)
      setForm(f => ({ ...f, resume_url: publicUrl, resume_uploaded: true }))
      setResumeFileName(file.name)
      // Simulate AI extraction — in production call Claude API here
      simulateExtraction()
    }
    setUploadingResume(false)
  }

  function simulateExtraction() {
    // In production: send file to Claude, parse response, pre-fill form
    const fakeExtracted = {
      skills: ['Product Management', 'Agile', 'SQL', 'Stakeholder Management', 'Roadmapping', 'Figma'],
      projects: [
        { name: 'Detected from resume — edit below', role: '', description: '', tech: '', duration: '', link: '' }
      ]
    }
    setExtractedData(fakeExtracted)
    setForm(f => ({
      ...f,
      skills: [...new Set([...f.skills, ...fakeExtracted.skills])],
      projects: fakeExtracted.projects,
    }))
  }

  async function finish() {
    setSaving(true)
    const payload = {
      ...form,
      budget_inr: 0,
      chatbot_prompts_used: 0,
      chatbot_prompts_limit: 5,
      free_prompts_used: 0,
      free_prompts_limit: 5,
    }
    await updateProfile(payload)
    setSaving(false)
    navigate('/dashboard')
  }

  const step0Valid = form.name.trim().length > 1 && form.city.trim().length > 1 && form.education !== ''
  const step1Valid = form.aspiration !== ''
  const showCTC = form.experience_slab !== '0-2'

  const stepTitles = ['Basics + Resume', 'Career goal', 'Skills', 'Review & confirm']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', paddingBottom: '2rem' }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>💼</span>
          <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--brand)' }}>Career Saathi</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--gray-400)' }}>Step {step + 1} of {STEPS.length}</span>
      </div>

      {/* Progress stepper */}
      <div style={{ padding: '16px 20px 0', maxWidth: '580px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600',
                flexShrink: 0, transition: 'all .3s',
                background: i < step ? 'var(--brand)' : i === step ? 'var(--brand)' : 'var(--gray-200)',
                color: i <= step ? '#fff' : 'var(--gray-500)',
                boxShadow: i === step ? '0 0 0 3px var(--brand-light)' : 'none',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: '2px', background: i < step ? 'var(--brand)' : 'var(--gray-200)', transition: 'background .3s' }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`, marginTop: '6px' }}>
          {STEPS.map((s, i) => (
            <p key={i} style={{ fontSize: '10px', textAlign: 'center', color: i === step ? 'var(--brand)' : 'var(--gray-400)', fontWeight: i === step ? '600' : '400' }}>{s}</p>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px', maxWidth: '580px', margin: '0 auto' }}>

        {/* ===== STEP 0: BASICS + RESUME ===== */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Let's get started</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Fill your basics, then upload your resume — AI auto-extracts your experience, projects and skills so you skip re-typing everything.
            </p>

            <div className="card">
              {/* Name + City */}
              <div className="form-row" style={{ marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Full name *</label>
                  <input value={form.name} onChange={set('name')} placeholder="Priya Sharma" />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>City *</label>
                  <CitySelect value={form.city} onChange={v => setVal('city', v)} placeholder="Type city…" />
                </div>
              </div>

              {/* Education + Stream */}
              <div className="form-row" style={{ marginBottom: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Highest education *</label>
                  <select value={form.education} onChange={set('education')}>
                    <option value="">Select…</option>
                    <option value="10th">10th pass</option>
                    <option value="12th">12th pass</option>
                    <option value="diploma">Diploma</option>
                    <option value="bcom">B.Com</option>
                    <option value="ba">B.A.</option>
                    <option value="bsc">B.Sc.</option>
                    <option value="btech">B.Tech / B.E.</option>
                    <option value="bba">BBA</option>
                    <option value="mba">MBA</option>
                    <option value="mtech">M.Tech</option>
                    <option value="mca">MCA</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Stream / Field</label>
                  <select value={form.stream} onChange={set('stream')}>
                    <option value="">Select…</option>
                    <option value="cs">Computer Science</option>
                    <option value="it">Information Technology</option>
                    <option value="commerce">Commerce</option>
                    <option value="arts">Arts / Humanities</option>
                    <option value="science">Science</option>
                    <option value="engineering">Engineering</option>
                    <option value="management">Management</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Experience slabs */}
              <div style={{ marginBottom: '12px' }}>
                <label>Years of experience *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '6px' }}>
                  {EXP_SLABS.map(s => (
                    <div key={s.value} onClick={() => setVal('experience_slab', s.value)}
                      style={{ padding: '8px 6px', border: `1.5px solid ${form.experience_slab === s.value ? 'var(--brand)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-md)', textAlign: 'center', cursor: 'pointer', background: form.experience_slab === s.value ? 'var(--brand-light)' : '#fff', transition: 'all .15s' }}>
                      <p style={{ fontSize: '12px', fontWeight: '600', color: form.experience_slab === s.value ? 'var(--brand)' : 'var(--gray-700)' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTC + Sector — only for experienced */}
              {showCTC && (
                <div className="form-row" style={{ marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Last / Current CTC (LPA) <span style={{ color: 'var(--gray-400)', fontWeight: '400' }}>optional</span></label>
                    <input type="number" value={form.last_ctc_lpa} onChange={set('last_ctc_lpa')} placeholder="e.g. 12" />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label>Sector preference</label>
                    <select value={form.sector} onChange={set('sector')}>
                      <option value="private">Private sector</option>
                      <option value="govt">Government / PSU</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Job type */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Preferred job type</label>
                <select value={form.job_type} onChange={set('job_type')}>
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>

              {/* Resume upload — RIGHT HERE after basics */}
              <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="var(--brand)" />
                  <label style={{ margin: 0, fontSize: '14px', color: 'var(--gray-900)', fontWeight: '600' }}>
                    Upload resume
                    <span style={{ fontSize: '12px', color: 'var(--gray-400)', fontWeight: '400', marginLeft: '6px' }}>optional but recommended</span>
                  </label>
                </div>

                <div style={{ background: 'var(--brand-light)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: '10px', fontSize: '12px', color: 'var(--brand)', lineHeight: '1.6' }}>
                  🤖 AI will auto-extract your work experience, projects, and skills — pre-filling the next steps so you skip re-typing everything
                </div>

                {!form.resume_uploaded ? (
                  <div onClick={() => fileRef.current.click()}
                    style={{ border: '1.5px dashed var(--gray-300)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.background = 'var(--brand-light)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-300)'; e.currentTarget.style.background = 'transparent' }}>
                    {uploadingResume
                      ? <div className="spinner" style={{ margin: '0 auto 8px' }} />
                      : <Upload size={28} color="var(--gray-400)" style={{ margin: '0 auto 8px', display: 'block' }} />
                    }
                    <p style={{ fontSize: '13px', fontWeight: '500', color: 'var(--gray-700)' }}>{uploadingResume ? 'Uploading…' : 'Click to upload your resume'}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)', marginTop: '3px' }}>PDF, DOC, DOCX · Max 5MB</p>
                  </div>
                ) : (
                  <div style={{ border: '1.5px solid var(--success)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', background: 'var(--success-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <CheckCircle size={20} color="var(--success)" />
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--success)' }}>Resume uploaded</p>
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{resumeFileName}</p>
                      </div>
                    </div>
                    {extractedData && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#fff', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: '500' }}>✓ {extractedData.skills.length} skills detected</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#fff', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: '500' }}>✓ {extractedData.projects.length} project detected</span>
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#fff', border: '1px solid var(--success)', color: 'var(--success)', fontWeight: '500' }}>✓ Pre-filling next steps</span>
                      </div>
                    )}
                    <button onClick={() => { setForm(f => ({ ...f, resume_uploaded: false, resume_url: '' })); setResumeFileName(''); setExtractedData(null) }} className="btn btn-outline btn-sm" style={{ marginTop: '8px' }}>Upload different file</button>
                  </div>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <p style={{ fontSize: '12px', color: step0Valid ? 'var(--success)' : 'var(--gray-400)' }}>
                {step0Valid ? '✓ Ready to continue' : 'Name, city and education required'}
              </p>
              <button className="btn btn-primary" onClick={() => setStep(1)} disabled={!step0Valid}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 1: CAREER GOAL ===== */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Career goal</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '1.25rem' }}>What role are you targeting? Drives job matching, courses, and interview prep.</p>

            <div className="card">
              <div className="form-group">
                <label>I want to become a… *</label>
                <select value={form.aspiration} onChange={set('aspiration')}>
                  <option value="">Select role…</option>
                  <optgroup label="Tech">{['Software Developer','Data Analyst','Data Scientist','Web Developer','Product Manager','DevOps Engineer','UI/UX Designer'].map(r => <option key={r}>{r}</option>)}</optgroup>
                  <optgroup label="Finance">{['Accountant','Financial Analyst','CA / CMA','Banking Professional','Tax Consultant'].map(r => <option key={r}>{r}</option>)}</optgroup>
                  <optgroup label="Management">{['Marketing Manager','Digital Marketer','HR Manager','Business Analyst'].map(r => <option key={r}>{r}</option>)}</optgroup>
                  <optgroup label="Other">{['Content Writer','Graphic Designer','Civil Engineer','Teacher / Educator','Government Job (SSC/UPSC)'].map(r => <option key={r}>{r}</option>)}</optgroup>
                </select>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label>What do you want to do first?</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                  {PRIMARY_GOALS.map(g => (
                    <div key={g.value} onClick={() => setVal('primary_goal', g.value)}
                      style={{ padding: '12px', border: `1.5px solid ${form.primary_goal === g.value ? 'var(--brand)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: form.primary_goal === g.value ? 'var(--brand-light)' : '#fff', transition: 'all .15s' }}>
                      <p style={{ fontSize: '18px', marginBottom: '4px' }}>{g.icon}</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: form.primary_goal === g.value ? 'var(--brand)' : 'var(--gray-800)' }}>{g.label}</p>
                      <p style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>{g.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(0)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!step1Valid}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: SKILLS ===== */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Skills</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '1rem' }}>Select everything you know — drives job matching and course recommendations.</p>

            {extractedData && (
              <div style={{ background: 'var(--success-light)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '8px 12px', marginBottom: '1rem', fontSize: '12px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} /> {extractedData.skills.length} skills auto-detected from your resume — already selected below. Edit as needed.
              </div>
            )}

            <div className="card">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SKILLS_OPTIONS.map(s => (
                  <span key={s} className={`chip ${form.skills.includes(s) ? 'active' : ''}`} onClick={() => toggleSkill(s)}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: REVIEW + PROJECTS ===== */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>Review & confirm</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '13px', marginBottom: '1.25rem' }}>Check your details. Projects auto-filled from resume — edit or add more.</p>

            {/* Summary */}
            <div className="card" style={{ background: 'var(--gray-50)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                {[
                  ['Name', form.name],
                  ['City', form.city],
                  ['Education', form.education?.toUpperCase()],
                  ['Experience', form.experience_slab + ' years'],
                  ['Goal', form.aspiration || 'Not set'],
                  ['Sector', form.sector],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ color: 'var(--gray-400)', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</p>
                    <p style={{ fontWeight: '500', color: 'var(--gray-800)', marginTop: '2px' }}>{v || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--success)" /> Projects
                {extractedData && <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: '400' }}>auto-filled from resume</span>}
              </p>
              {form.projects.map((p, i) => (
                <div key={i} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '8px', background: '#fff', position: 'relative' }}>
                  {extractedData && i < extractedData.projects.length && (
                    <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '10px', padding: '2px 7px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', fontWeight: '600' }}>Auto-detected</span>
                  )}
                  {form.projects.length > 1 && (
                    <button onClick={() => removeProject(i)} style={{ position: 'absolute', top: extractedData ? '26px' : '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><Trash2 size={13} /></button>
                  )}
                  <div className="form-row" style={{ marginBottom: '8px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Project title</label>
                      <input value={p.name} onChange={e => setProject(i, 'name', e.target.value)} placeholder="Sales Dashboard in Power BI" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Your role</label>
                      <input value={p.role} onChange={e => setProject(i, 'role', e.target.value)} placeholder="PM / Developer / Analyst" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label>Key achievements</label>
                    <textarea value={p.description} onChange={e => setProject(i, 'description', e.target.value)} rows={2} style={{ resize: 'vertical' }} placeholder="• Increased cart value by 23%&#10;• Led team of 12" />
                  </div>
                  <div className="form-row">
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Tech stack</label>
                      <input value={p.tech} onChange={e => setProject(i, 'tech', e.target.value)} placeholder="Python, SQL, Figma" />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Duration</label>
                      <input value={p.duration} onChange={e => setProject(i, 'duration', e.target.value)} placeholder="Jan – Dec 2023" />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addProject} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                <Plus size={13} /> Add project
              </button>
            </div>

            {/* LinkedIn */}
            <div className="card" style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>LinkedIn <span style={{ color: 'var(--gray-400)', fontWeight: '400', fontSize: '12px' }}>optional</span></p>
              <div className="form-group" style={{ marginBottom: '8px' }}>
                <label>LinkedIn URL</label>
                <input value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/yourname" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Current headline</label>
                <input value={form.linkedin_headline} onChange={set('linkedin_headline')} placeholder="Senior PM | 8 yrs | Open to Work" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={16} /> Back</button>
              <button className="btn btn-primary btn-lg" onClick={finish} disabled={saving}>
                {saving
                  ? <><span className="spinner" style={{ borderTopColor: '#fff', width: '16px', height: '16px' }} /> Saving…</>
                  : <>🚀 Go to dashboard <ChevronRight size={16} /></>
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
