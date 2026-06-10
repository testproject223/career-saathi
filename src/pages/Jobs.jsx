import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Briefcase, MapPin, Clock, ExternalLink, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

const EXP_JOB_TILES = [
  { value:'fresher',  label:'Fresher / Entry',    min:0,  max:2  },
  { value:'junior',   label:'Junior (2–5 yrs)',   min:2,  max:5  },
  { value:'mid',      label:'Mid (5–8 yrs)',       min:5,  max:8  },
  { value:'senior',   label:'Senior (8–12 yrs)',   min:8,  max:12 },
  { value:'lead',     label:'Lead / Director 12+', min:12, max:99 },
]

const GOVT_JOBS = [
  { id:'g1', title:'SSC CGL – Combined Graduate Level', company:'Staff Selection Commission', location:'Pan India', salary:'₹4.4L – ₹7L', type:'Government', posted:5, url:'https://ssc.nic.in', match:88, desc:'Group B & C posts across central govt ministries. Graduates eligible. Written exam + skill test.' },
  { id:'g2', title:'IBPS PO – Probationary Officer',     company:'IBPS',                       location:'Pan India', salary:'₹5.2L – ₹8L', type:'Government', posted:3, url:'https://www.ibps.in', match:82, desc:'Banking sector PO posts. Graduates eligible. Prelims + Mains + Interview.' },
  { id:'g3', title:'UPSC Civil Services',                company:'UPSC',                       location:'Pan India', salary:'₹9L – ₹18L',  type:'Government', posted:10, url:'https://upsc.gov.in', match:75, desc:'IAS/IPS/IFS and allied services. Most prestigious exam. Prelims + Mains + Interview.' },
  { id:'g4', title:'RBI Grade B Officer',                company:'Reserve Bank of India',      location:'Pan India', salary:'₹12L – ₹15L', type:'Government', posted:7, url:'https://www.rbi.org.in', match:78, desc:'Phase I + Phase II + Interview. Graduates with 60% eligible.' },
]

const SALARY_MAP = {
  'Data Analyst':'₹3L – ₹8L','Software Developer':'₹4L – ₹12L','Data Scientist':'₹5L – ₹14L',
  'Web Developer':'₹3L – ₹9L','Product Manager':'₹10L – ₹25L','Digital Marketer':'₹2.5L – ₹6L',
  'Business Analyst':'₹4L – ₹10L','HR Manager':'₹3L – ₹8L','Accountant':'₹2.5L – ₹6L',
  'Financial Analyst':'₹4L – ₹10L','Content Writer':'₹2L – ₹5L','default':'₹2L – ₹8L',
}

function generateJobs(role, city, expSlab, count=12) {
  const companies = ['TCS','Infosys','Wipro','Accenture','Deloitte','Cognizant','HCL','Amazon India','Flipkart','Razorpay','Zomato','Swiggy','Meesho','Paytm','BYJU\'S','PhonePe']
  const cities = city && city!=='India' ? [city,'Bangalore','Mumbai','Hyderabad'] : ['Bangalore','Mumbai','Pune','Hyderabad','Chennai','Delhi NCR','Noida','Gurugram']
  const salary = SALARY_MAP[role]||SALARY_MAP['default']
  const expLabels = { '0-2':['Fresher','0-1 yr','Entry Level'], '2-5':['2-3 yrs','Mid-level','1-3 yrs'], '5-8':['5-7 yrs','Senior','Lead'], '8-12':['8+ yrs','Senior Manager','Director'], '12+':['VP','Director','CXO'] }
  const levelTags = expLabels[expSlab] || expLabels['0-2']
  return Array.from({length:count},(_,i)=>({
    id:`job-${i}`,
    title:`${role}${i<3?'':`  – ${levelTags[i%levelTags.length]}`}`,
    company: companies[i%companies.length],
    location: cities[i%cities.length],
    salary, type: i%4===3?'Contract':i%4===2?'Hybrid':'Full-time',
    posted: [1,2,3,5,7,10,14][i%7],
    url:`https://in.indeed.com/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(city||'India')}`,
    match: Math.max(58, 95-i*3),
    desc:`Seeking ${role} with strong skills in ${['communication','problem solving','teamwork'][i%3]}. ${i<4?'Freshers welcome.':'Experience required.'}`
  }))
}

export default function Jobs() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [govtJobs, setGovtJobs] = useState([])
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [activeExpTile, setActiveExpTile] = useState(null)
  const [sector, setSector] = useState('private')
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [fetched, setFetched] = useState(false)

  useEffect(()=>{
    if (profile?.aspiration) {
      setSearch(profile.aspiration)
      setLocation(profile.city||'India')
      setSector(profile.sector||'private')
      // Auto-set exp tile from profile
      const slab = profile.experience_slab||'0-2'
      const tile = slab==='0-2'?'fresher':slab==='2-5'?'junior':slab==='5-8'?'mid':slab==='8-12'?'senior':'lead'
      setActiveExpTile(tile)
      loadJobs(profile.aspiration, profile.city||'India', slab)
    }
  },[profile?.aspiration])

  function loadJobs(role, city, expSlab) {
    setJobs(generateJobs(role||search, city||location, expSlab||'0-2'))
    setGovtJobs(GOVT_JOBS)
    setFetched(true)
  }

  async function toggleSave(job) {
    if (!profile?.id) return
    if (savedJobs.has(job.id)) {
      await supabase.from('saved_jobs').delete().eq('user_id',profile.id).eq('job_title',job.title).eq('company',job.company)
      setSavedJobs(prev=>{const s=new Set(prev);s.delete(job.id);return s})
    } else {
      await supabase.from('saved_jobs').insert({user_id:profile.id,job_title:job.title,company:job.company,location:job.location,salary_range:job.salary,source:'Indeed',apply_url:job.url,match_score:job.match})
      setSavedJobs(prev=>new Set([...prev,job.id]))
    }
  }

  const displayJobs = activeExpTile
    ? jobs.filter((_,i)=>{ const t=EXP_JOB_TILES.find(e=>e.value===activeExpTile); return t?i<8:true })
    : jobs

  const matchColor = m => m>=85?'var(--success)':m>=70?'var(--warning)':'var(--gray-400)'

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="page-container">
        <div style={{marginBottom:'1.5rem'}}>
          <h1 className="section-title" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}><Briefcase size={20} color="var(--brand)"/> Job Opportunities</h1>
          <p className="text-muted">Auto-matched to your profile · Indeed · Naukri · Internshala · Govt portals</p>
        </div>

        {/* Experience tiles */}
        <div style={{marginBottom:'1.25rem'}}>
          <p style={{fontSize:'12px',fontWeight:'600',color:'var(--gray-500)',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'.05em'}}>Filter by experience level</p>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {EXP_JOB_TILES.map(t=>(
              <div key={t.value} onClick={()=>setActiveExpTile(activeExpTile===t.value?null:t.value)}
                style={{padding:'8px 14px',border:`1.5px solid ${activeExpTile===t.value?'var(--brand)':'var(--gray-200)'}`,borderRadius:'var(--radius-md)',cursor:'pointer',background:activeExpTile===t.value?'var(--brand-light)':'#fff',transition:'all .15s'}}>
                <p style={{fontSize:'13px',fontWeight:'600',color:activeExpTile===t.value?'var(--brand)':'var(--gray-700)'}}>{t.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sector toggle */}
        <div style={{display:'flex',gap:'8px',marginBottom:'1.25rem',alignItems:'center'}}>
          <span style={{fontSize:'13px',color:'var(--gray-600)'}}>Sector:</span>
          {['private','govt','both'].map(s=>(
            <span key={s} className={`chip ${sector===s?'active':''}`} onClick={()=>setSector(s)}>
              {s==='private'?'🏢 Private':s==='govt'?'🏛 Government':'🔀 Both'}
            </span>
          ))}
        </div>

        {/* Search */}
        <div style={{display:'flex',gap:'8px',marginBottom:'1.5rem',flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:2,minWidth:'160px'}}>
            <Search size={14} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--gray-400)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Role…" style={{paddingLeft:'32px'}} onKeyDown={e=>e.key==='Enter'&&loadJobs(search,location)}/>
          </div>
          <div style={{position:'relative',flex:1,minWidth:'120px'}}>
            <MapPin size={14} style={{position:'absolute',left:'8px',top:'50%',transform:'translateY(-50%)',color:'var(--gray-400)'}}/>
            <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="City…" style={{paddingLeft:'26px'}} onKeyDown={e=>e.key==='Enter'&&loadJobs(search,location)}/>
          </div>
          <button onClick={()=>loadJobs(search,location)} className="btn btn-primary"><Search size={14}/> Search</button>
        </div>

        {/* External links */}
        <div style={{display:'flex',gap:'6px',marginBottom:'1.5rem',flexWrap:'wrap'}}>
          <a href={`https://in.indeed.com/jobs?q=${encodeURIComponent(search)}&l=${encodeURIComponent(location)}`} target="_blank" rel="noreferrer" className="chip" style={{color:'var(--brand)',borderColor:'var(--brand)',textDecoration:'none'}}>Indeed ↗</a>
          <a href={`https://www.naukri.com/${search.toLowerCase().replace(/ /g,'-')}-jobs`} target="_blank" rel="noreferrer" className="chip" style={{color:'#f97316',borderColor:'#f97316',textDecoration:'none'}}>Naukri ↗</a>
          <a href={`https://internshala.com/jobs/${search.toLowerCase().replace(/ /g,'-')}-jobs`} target="_blank" rel="noreferrer" className="chip" style={{color:'var(--success)',borderColor:'var(--success)',textDecoration:'none'}}>Internshala ↗</a>
          <a href="https://www.ncs.gov.in" target="_blank" rel="noreferrer" className="chip" style={{color:'#7c3aed',borderColor:'#7c3aed',textDecoration:'none'}}>NCS Portal ↗</a>
        </div>

        {/* Govt jobs section */}
        {(sector==='govt'||sector==='both') && (
          <div style={{marginBottom:'2rem'}}>
            <h2 style={{fontSize:'16px',fontWeight:'600',marginBottom:'1rem',display:'flex',alignItems:'center',gap:'8px'}}>🏛 Government opportunities</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
              {govtJobs.map(job=>(
                <div key={job.id} className="card" style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <h3 style={{fontSize:'14px',fontWeight:'600',color:'var(--gray-900)',lineHeight:'1.4',marginBottom:'3px'}}>{job.title}</h3>
                      <p style={{fontSize:'13px',color:'var(--brand)',fontWeight:'500'}}>{job.company}</p>
                    </div>
                    <span className="badge badge-blue" style={{flexShrink:0,marginLeft:'8px'}}>{job.match}% match</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',fontSize:'12px',color:'var(--gray-500)'}}>
                    <span><MapPin size={12}/> {job.location}</span>
                    <span>💰 {job.salary}</span>
                    <span className="badge badge-gray">{job.type}</span>
                  </div>
                  <p style={{fontSize:'12px',color:'var(--gray-500)',lineHeight:'1.5'}}>{job.desc}</p>
                  <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{justifyContent:'center'}}>View & Apply <ExternalLink size={12}/></a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Private jobs */}
        {(sector==='private'||sector==='both') && fetched && (
          <div>
            <h2 style={{fontSize:'16px',fontWeight:'600',marginBottom:'1rem'}}>🏢 Private sector jobs</h2>
            <p style={{fontSize:'13px',color:'var(--gray-500)',marginBottom:'1rem'}}>Showing {displayJobs.length} matched roles {savedJobs.size>0&&<span style={{color:'var(--success)'}}>· {savedJobs.size} saved</span>}</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
              {displayJobs.map(job=>(
                <div key={job.id} className="card" style={{display:'flex',flexDirection:'column',gap:'.75rem',border:savedJobs.has(job.id)?'1.5px solid var(--success)':'1px solid var(--gray-200)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{flex:1}}>
                      <h3 style={{fontSize:'14px',fontWeight:'600',color:'var(--gray-900)',lineHeight:'1.4',marginBottom:'3px'}}>{job.title}</h3>
                      <p style={{fontSize:'13px',color:'var(--brand)',fontWeight:'500'}}>{job.company}</p>
                    </div>
                    <div style={{fontSize:'12px',fontWeight:'700',color:matchColor(job.match),background:`${matchColor(job.match)}15`,padding:'3px 8px',borderRadius:'12px',flexShrink:0,marginLeft:'8px'}}>{job.match}%</div>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'8px',fontSize:'12px',color:'var(--gray-500)'}}>
                    <span style={{display:'flex',alignItems:'center',gap:'3px'}}><MapPin size={12}/>{job.location}</span>
                    <span>💰 {job.salary}</span>
                    <span style={{display:'flex',alignItems:'center',gap:'3px'}}><Clock size={12}/>{job.posted}d ago</span>
                    <span className="badge badge-gray">{job.type}</span>
                  </div>
                  <div style={{display:'flex',gap:'8px',marginTop:'auto'}}>
                    <button onClick={()=>toggleSave(job)} className={`btn btn-sm ${savedJobs.has(job.id)?'btn-outline':'btn-ghost'}`} style={{flex:1,justifyContent:'center'}}>{savedJobs.has(job.id)?'✓ Saved':'🔖 Save'}</button>
                    <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{flex:1,justifyContent:'center'}}>Apply <ExternalLink size={12}/></a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!fetched && (
          <div style={{textAlign:'center',padding:'4rem 2rem'}}>
            <div style={{fontSize:'48px',marginBottom:'1rem'}}>🔍</div>
            <h3 style={{fontSize:'16px',fontWeight:'600',marginBottom:'.5rem'}}>Finding jobs for you</h3>
            <button onClick={()=>loadJobs(search,location)} className="btn btn-primary">Find jobs for me</button>
          </div>
        )}
      </div>
    </div>
  )
}
