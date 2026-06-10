import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronRight, ChevronLeft, Plus, Trash2, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { EXP_SLABS } from '../lib/persona'

const SKILLS_OPTIONS = ['Excel','SQL','Python','Tally','Java','C++','React','Node.js',
  'Digital Marketing','Content Writing','Accounting','Data Entry','Photoshop',
  'AutoCAD','Spoken English','Power BI','Tableau','R','Machine Learning','HTML/CSS',
  'Product Management','Agile','Leadership','Project Management','Financial Analysis']

const STEPS = ['Basic info','Career goal','Skills','LinkedIn','Projects','Resume']
const EMPTY_PROJECT = { name:'', role:'', description:'', tech:'', duration:'', link:'' }

const GOAL_OPTIONS = [
  { value:'find_job',       icon:'🔍', label:'Find a job',              sub:'Search roles, apply, save' },
  { value:'resume_linkedin',icon:'📝', label:'Build resume + LinkedIn', sub:'ATS resume + profile copy' },
  { value:'learn_apply',    icon:'📚', label:'Learn and apply',         sub:'Courses + skills + jobs' },
  { value:'interview_prep', icon:'🎤', label:'Interview prep',          sub:'Mock Q&A, readiness score' },
  { value:'portfolio',      icon:'💡', label:'Build portfolio',         sub:'Projects + open source' },
]

export default function Onboarding() {
  const { updateProfile, user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef()
  const [resumeFileName, setResumeFileName] = useState('')
  const [uploadingResume, setUploadingResume] = useState(false)

  const [form, setForm] = useState({
    city:'', education:'', stream:'',
    aspiration:'', experience_slab:'0-2', sector:'private',
    last_ctc_lpa:'', primary_goal:'find_job',
    job_type:'any', skills:[], linkedin_url:'',
    linkedin_headline:'', linkedin_about:'',
    projects:[{ ...EMPTY_PROJECT }],
    resume_uploaded:false, resume_url:'',
  })

  const set = k => e => setForm(f=>({...f,[k]:e.target.value}))
  const setVal = (k,v) => setForm(f=>({...f,[k]:v}))
  const toggleSkill = s => setForm(f=>({
    ...f, skills: f.skills.includes(s) ? f.skills.filter(x=>x!==s) : [...f.skills,s]
  }))
  const setProject = (idx,field,val) => setForm(f=>({
    ...f, projects: f.projects.map((p,i)=>i===idx?{...p,[field]:val}:p)
  }))
  const addProject = () => setForm(f=>({...f,projects:[...f.projects,{...EMPTY_PROJECT}]}))
  const removeProject = idx => setForm(f=>({...f,projects:f.projects.filter((_,i)=>i!==idx)}))

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file || !user) return
    setUploadingResume(true)
    const path = `${user.id}/resume-${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('resumes').upload(path, file, { upsert:true })
    if (!error) {
      const { data:{ publicUrl } } = supabase.storage.from('resumes').getPublicUrl(path)
      setForm(f=>({...f, resume_url:publicUrl, resume_uploaded:true}))
      setResumeFileName(file.name)
    }
    setUploadingResume(false)
  }

  async function finish() {
    setLoading(true)
    await updateProfile({ ...form, budget_inr: 0 })
    navigate('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'var(--gray-50)'}}>
      <div style={{width:'100%',maxWidth:'580px'}}>
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <h1 style={{fontSize:'22px',fontWeight:'700'}}>Set up your profile</h1>
          <p style={{color:'var(--gray-500)',fontSize:'14px',marginTop:'.25rem'}}>Step {step+1} of {STEPS.length}</p>
        </div>

        <div style={{display:'flex',gap:'4px',marginBottom:'2rem'}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{flex:1}}>
              <div style={{height:'4px',borderRadius:'2px',background:i<=step?'var(--brand)':'var(--gray-200)',transition:'background .3s'}}/>
              <p style={{fontSize:'10px',color:i===step?'var(--brand)':'var(--gray-400)',fontWeight:i===step?'600':'400',marginTop:'4px',textAlign:'center'}}>{s}</p>
            </div>
          ))}
        </div>

        <div className="card">

          {/* STEP 0 — Basic info */}
          {step===0 && (
            <div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'1.25rem'}}>Basic information</h3>
              <div className="form-group"><label>City / Town *</label><input value={form.city} onChange={set('city')} placeholder="e.g. Pune, Delhi, Gurugram"/></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Highest education *</label>
                  <select value={form.education} onChange={set('education')}>
                    <option value="">Select…</option>
                    <option value="10th">10th pass</option><option value="12th">12th pass</option>
                    <option value="diploma">Diploma</option><option value="bcom">B.Com</option>
                    <option value="ba">B.A.</option><option value="bsc">B.Sc.</option>
                    <option value="btech">B.Tech / B.E.</option><option value="bba">BBA</option>
                    <option value="mba">MBA</option><option value="mtech">M.Tech</option>
                    <option value="mca">MCA</option><option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Stream / Field</label>
                  <select value={form.stream} onChange={set('stream')}>
                    <option value="">Select…</option>
                    <option value="cs">Computer Science</option><option value="it">Information Technology</option>
                    <option value="commerce">Commerce</option><option value="arts">Arts / Humanities</option>
                    <option value="science">Science</option><option value="engineering">Engineering</option>
                    <option value="management">Management</option><option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Experience slabs */}
              <div className="form-group">
                <label>Years of experience *</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',marginTop:'6px'}}>
                  {EXP_SLABS.map(s=>(
                    <div key={s.value} onClick={()=>setVal('experience_slab',s.value)}
                      style={{padding:'10px 8px',border:`1.5px solid ${form.experience_slab===s.value?'var(--brand)':'var(--gray-200)'}`,borderRadius:'var(--radius-md)',textAlign:'center',cursor:'pointer',background:form.experience_slab===s.value?'var(--brand-light)':'#fff',transition:'all .15s'}}>
                      <p style={{fontSize:'13px',fontWeight:'600',color:form.experience_slab===s.value?'var(--brand)':'var(--gray-700)'}}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Last CTC — only if not fresher */}
              {form.experience_slab !== '0-2' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Last / Current CTC (LPA) <span style={{color:'var(--gray-400)',fontWeight:'400'}}>optional</span></label>
                    <input type="number" value={form.last_ctc_lpa} onChange={set('last_ctc_lpa')} placeholder="e.g. 8"/>
                  </div>
                  <div className="form-group">
                    <label>Sector preference</label>
                    <select value={form.sector} onChange={set('sector')}>
                      <option value="private">Private sector</option>
                      <option value="govt">Government / PSU</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Preferred job type</label>
                <select value={form.job_type} onChange={set('job_type')}>
                  <option value="any">Any</option><option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option><option value="onsite">On-site</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 1 — Career goal + primary goal */}
          {step===1 && (
            <div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'1.25rem'}}>Career goal</h3>
              <div className="form-group">
                <label>I want to become a… *</label>
                <select value={form.aspiration} onChange={set('aspiration')}>
                  <option value="">Select role…</option>
                  <optgroup label="Tech"><option>Software Developer</option><option>Data Analyst</option><option>Data Scientist</option><option>Web Developer</option><option>DevOps Engineer</option><option>UI/UX Designer</option><option>Cybersecurity Analyst</option><option>Product Manager</option></optgroup>
                  <optgroup label="Finance"><option>Accountant</option><option>Financial Analyst</option><option>CA / CMA</option><option>Banking Professional</option><option>Tax Consultant</option></optgroup>
                  <optgroup label="Management"><option>Marketing Manager</option><option>Digital Marketer</option><option>HR Manager</option><option>Business Analyst</option></optgroup>
                  <optgroup label="Other"><option>Content Writer</option><option>Graphic Designer</option><option>Civil Engineer</option><option>Teacher / Educator</option><option>Government Job (SSC/UPSC)</option></optgroup>
                </select>
              </div>
              <div className="form-group">
                <label>What do you want to do first?</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginTop:'6px'}}>
                  {GOAL_OPTIONS.map(g=>(
                    <div key={g.value} onClick={()=>setVal('primary_goal',g.value)}
                      style={{padding:'12px',border:`1.5px solid ${form.primary_goal===g.value?'var(--brand)':'var(--gray-200)'}`,borderRadius:'var(--radius-md)',cursor:'pointer',background:form.primary_goal===g.value?'var(--brand-light)':'#fff',transition:'all .15s'}}>
                      <p style={{fontSize:'16px',marginBottom:'3px'}}>{g.icon}</p>
                      <p style={{fontSize:'13px',fontWeight:'600',color:form.primary_goal===g.value?'var(--brand)':'var(--gray-700)'}}>{g.label}</p>
                      <p style={{fontSize:'11px',color:'var(--gray-500)',marginTop:'2px'}}>{g.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Skills */}
          {step===2 && (
            <div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'1.25rem'}}>Skills you have</h3>
              <div className="form-group">
                <label>Select all that apply *</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'6px'}}>
                  {SKILLS_OPTIONS.map(s=>(
                    <span key={s} className={`chip ${form.skills.includes(s)?'active':''}`} onClick={()=>toggleSkill(s)}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — LinkedIn */}
          {step===3 && (
            <div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'.5rem'}}>LinkedIn <span style={{fontSize:'13px',color:'var(--gray-400)',fontWeight:'400'}}>(optional)</span></h3>
              <p style={{fontSize:'13px',color:'var(--gray-500)',marginBottom:'1.25rem'}}>Add your LinkedIn to get personalised profile copy and job connection tips</p>
              <div className="form-group"><label>LinkedIn URL</label><input value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/yourname"/></div>
              <div className="form-group"><label>Current headline</label><input value={form.linkedin_headline} onChange={set('linkedin_headline')} placeholder="e.g. Senior PM | 8 yrs | Product Strategy | Open to Work"/></div>
              <div className="form-group"><label>Current About section</label><textarea value={form.linkedin_about} onChange={set('linkedin_about')} rows={4} placeholder="Paste existing About section to improve it…"/></div>
              <div style={{padding:'1rem',background:'var(--brand-light)',borderRadius:'var(--radius-md)',fontSize:'13px',color:'var(--brand)'}}>💡 Don't have LinkedIn yet? Skip — we'll generate your complete profile after setup.</div>
            </div>
          )}

          {/* STEP 4 — Projects */}
          {step===4 && (
            <div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'.5rem'}}>Projects <span style={{fontSize:'13px',color:'var(--gray-400)',fontWeight:'400'}}>(optional)</span></h3>
              <p style={{fontSize:'13px',color:'var(--gray-500)',marginBottom:'1.25rem'}}>Academic, personal, or work projects — these strengthen your resume and LinkedIn</p>
              {form.projects.map((p,i)=>(
                <div key={i} style={{border:'1px solid var(--gray-200)',borderRadius:'var(--radius-md)',padding:'1rem',marginBottom:'.75rem',background:'var(--gray-50)',position:'relative'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'.75rem'}}>
                    <span style={{fontSize:'13px',fontWeight:'600',color:'var(--gray-700)'}}>Project {i+1}</span>
                    {form.projects.length>1 && <button onClick={()=>removeProject(i)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--gray-400)'}}><Trash2 size={14}/></button>}
                  </div>
                  <div className="form-group"><label>Project title *</label><input value={p.name} onChange={e=>setProject(i,'name',e.target.value)} placeholder="Sales Dashboard using Power BI"/></div>
                  <div className="form-group"><label>Your role</label><input value={p.role} onChange={e=>setProject(i,'role',e.target.value)} placeholder="Lead Developer / Product Manager / Data Analyst"/></div>
                  <div className="form-group"><label>Responsibilities & what you achieved</label><textarea value={p.description} onChange={e=>setProject(i,'description',e.target.value)} rows={3} placeholder="• Built X that improved Y by Z%&#10;• Led team of N people&#10;• Delivered in X weeks"/></div>
                  <div className="form-row">
                    <div className="form-group"><label>Tech stack</label><input value={p.tech} onChange={e=>setProject(i,'tech',e.target.value)} placeholder="Power BI, SQL, Excel"/></div>
                    <div className="form-group"><label>Duration</label><input value={p.duration} onChange={e=>setProject(i,'duration',e.target.value)} placeholder="Jan 2024 – Mar 2024"/></div>
                  </div>
                  <div className="form-group"><label>Link (GitHub / live)</label><input value={p.link} onChange={e=>setProject(i,'link',e.target.value)} placeholder="https://github.com/…"/></div>
                </div>
              ))}
              <button onClick={addProject} className="btn btn-outline btn-sm" style={{width:'100%',justifyContent:'center'}}><Plus size={14}/> Add project</button>
            </div>
          )}

          {/* STEP 5 — Resume */}
          {step===5 && (
            <div>
              <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'.5rem'}}>Upload your resume <span style={{fontSize:'13px',color:'var(--gray-400)',fontWeight:'400'}}>(optional)</span></h3>
              <p style={{fontSize:'13px',color:'var(--gray-500)',marginBottom:'1.5rem'}}>Upload and we'll auto-optimise it for your target role. Or skip to build from scratch.</p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{display:'none'}} onChange={handleResumeUpload}/>
              {!form.resume_uploaded ? (
                <div onClick={()=>fileRef.current.click()} style={{border:'2px dashed var(--gray-300)',borderRadius:'var(--radius-lg)',padding:'2.5rem',textAlign:'center',cursor:'pointer',transition:'all .15s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--brand)';e.currentTarget.style.background='var(--brand-light)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--gray-300)';e.currentTarget.style.background='transparent'}}>
                  {uploadingResume?<div className="spinner" style={{margin:'0 auto 1rem'}}/>:<Upload size={32} color="var(--gray-400)" style={{margin:'0 auto 1rem',display:'block'}}/>}
                  <p style={{fontSize:'14px',fontWeight:'500',color:'var(--gray-700)'}}>{uploadingResume?'Uploading…':'Click to upload your resume'}</p>
                  <p style={{fontSize:'12px',color:'var(--gray-400)',marginTop:'4px'}}>PDF, DOC, DOCX · Max 5MB</p>
                </div>
              ) : (
                <div style={{border:'1.5px solid var(--success)',borderRadius:'var(--radius-lg)',padding:'1.5rem',textAlign:'center',background:'var(--success-light)'}}>
                  <p style={{fontSize:'24px',marginBottom:'.5rem'}}>✅</p>
                  <p style={{fontSize:'14px',fontWeight:'600',color:'var(--success)'}}>Resume uploaded!</p>
                  <p style={{fontSize:'13px',color:'var(--gray-600)',marginTop:'4px'}}>{resumeFileName}</p>
                  <button onClick={()=>{setForm(f=>({...f,resume_uploaded:false,resume_url:''}));setResumeFileName('')}} className="btn btn-outline btn-sm" style={{marginTop:'1rem'}}>Upload different file</button>
                </div>
              )}
            </div>
          )}

          <div style={{display:'flex',justifyContent:'space-between',marginTop:'1.75rem'}}>
            {step>0 ? <button className="btn btn-outline" onClick={()=>setStep(s=>s-1)}><ChevronLeft size={16}/> Back</button> : <div/>}
            {step<STEPS.length-1
              ? <button className="btn btn-primary" onClick={()=>setStep(s=>s+1)}>
                  {step>=3?'Skip / Next':'Next'} <ChevronRight size={16}/>
                </button>
              : <button className="btn btn-primary" onClick={finish} disabled={loading}>
                  {loading?<span className="spinner" style={{borderTopColor:'#fff',width:'16px',height:'16px'}}/>:<>Go to dashboard <ChevronRight size={16}/></>}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
