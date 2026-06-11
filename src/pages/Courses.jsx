import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { BookOpen, ExternalLink, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BUDGET_TILES } from '../lib/persona'

const PLATFORM_CONFIG = {
  youtube:       { label:'YouTube',      color:'#a32d2d', bg:'#fff0f0', icon:'▶' },
  coursera:      { label:'Coursera',     color:'#0c447c', bg:'#e6f1fb', icon:'🎓' },
  nptel:         { label:'NPTEL',        color:'#185fa5', bg:'#e8f0fe', icon:'🏛' },
  great_learning:{ label:'Great Learning',color:'#534ab7',bg:'#f0ecfe', icon:'📚' },
  udemy:         { label:'Udemy',        color:'#6b21a8', bg:'#f3e8ff', icon:'🎯' },
  internshala:   { label:'Internshala', color:'#0f6e56', bg:'#e1f5ee', icon:'💼' },
  swayam:        { label:'Swayam',       color:'#3b6d11', bg:'#eaf3de', icon:'🇮🇳' },
}

const ALL_COURSES = [
  // Data / Analytics
  { id:1,  title:'SQL Tutorial – Full Course',         platform:'youtube',        cost:0,    rating:4.8, duration:'4.5 hrs', level:'Beginner',     skills:['sql','database','analytics'],             role:['Data Analyst','Business Analyst','Data Scientist'] },
  { id:2,  title:'Python for Data Analysis',           platform:'youtube',        cost:0,    rating:4.7, duration:'6 hrs',   level:'Beginner',     skills:['python','pandas','data','analytics'],     role:['Data Analyst','Data Scientist'] },
  { id:3,  title:'Statistics for Data Science',        platform:'youtube',        cost:0,    rating:4.5, duration:'3 hrs',   level:'Beginner',     skills:['statistics','data','ml'],                 role:['Data Analyst','Data Scientist'] },
  { id:4,  title:'Machine Learning – Andrew Ng',       platform:'coursera',       cost:4500, rating:4.9, duration:'3 months',level:'Intermediate', skills:['ml','machine learning','python','ai'],    role:['Data Scientist'] },
  { id:5,  title:'Google Data Analytics Certificate',  platform:'coursera',       cost:3200, rating:4.8, duration:'6 months',level:'Beginner',     skills:['sql','r','tableau','analytics','excel'],  role:['Data Analyst','Business Analyst'] },
  { id:6,  title:'Data Analysis using Python – NPTEL', platform:'nptel',          cost:0,    rating:4.6, duration:'8 weeks', level:'Intermediate', skills:['python','numpy','pandas','data'],         role:['Data Analyst','Data Scientist'] },
  { id:7,  title:'Data Analytics Free Course',         platform:'great_learning', cost:0,    rating:4.5, duration:'40 hrs',  level:'Beginner',     skills:['excel','sql','python','analytics'],       role:['Data Analyst'] },
  { id:8,  title:'Tableau 2024 A-Z',                   platform:'udemy',          cost:699,  rating:4.6, duration:'8 hrs',   level:'Beginner',     skills:['tableau','visualization','analytics'],    role:['Data Analyst','Business Analyst'] },
  // Frontend / Web
  { id:9,  title:'React JS Full Course',               platform:'youtube',        cost:0,    rating:4.8, duration:'12 hrs',  level:'Intermediate', skills:['react','javascript','frontend','web'],    role:['Web Developer','Software Developer'] },
  { id:10, title:'HTML & CSS Crash Course',            platform:'youtube',        cost:0,    rating:4.7, duration:'3 hrs',   level:'Beginner',     skills:['html','css','web','frontend'],            role:['Web Developer','Software Developer'] },
  { id:11, title:'JavaScript Full Course',             platform:'youtube',        cost:0,    rating:4.7, duration:'12 hrs',  level:'Beginner',     skills:['javascript','js','frontend','web'],       role:['Web Developer','Software Developer'] },
  { id:12, title:'Front End Dev Bootcamp',             platform:'udemy',          cost:999,  rating:4.8, duration:'55 hrs',  level:'Beginner',     skills:['html','css','javascript','react','frontend','web'],role:['Web Developer'] },
  { id:13, title:'Front End Development – GL',         platform:'great_learning', cost:0,    rating:4.4, duration:'20 hrs',  level:'Beginner',     skills:['html','css','javascript','frontend'],    role:['Web Developer'] },
  // Software / CS
  { id:14, title:'DSA – Abdul Bari',                   platform:'youtube',        cost:0,    rating:4.9, duration:'25 hrs',  level:'Intermediate', skills:['dsa','algorithms','java','c++'],          role:['Software Developer'] },
  { id:15, title:'Programming in Java – NPTEL',        platform:'nptel',          cost:0,    rating:4.7, duration:'12 weeks',level:'Beginner',     skills:['java','oop','programming'],               role:['Software Developer'] },
  { id:16, title:'Python Bootcamp – GL',               platform:'great_learning', cost:0,    rating:4.5, duration:'30 hrs',  level:'Beginner',     skills:['python','programming','backend'],         role:['Software Developer','Data Scientist'] },
  // Marketing
  { id:17, title:'Digital Marketing Full Course',      platform:'youtube',        cost:0,    rating:4.6, duration:'8 hrs',   level:'Beginner',     skills:['digital marketing','seo','social media'], role:['Digital Marketer','Marketing Manager'] },
  { id:18, title:'Google Digital Marketing Cert',      platform:'coursera',       cost:3200, rating:4.7, duration:'6 months',level:'Beginner',     skills:['seo','analytics','ads','campaigns'],      role:['Digital Marketer'] },
  { id:19, title:'Social Media Marketing – GL',        platform:'great_learning', cost:0,    rating:4.4, duration:'20 hrs',  level:'Beginner',     skills:['social media','content','marketing'],     role:['Digital Marketer','Content Writer'] },
  // Finance
  { id:20, title:'Excel – Beginner to Advanced',       platform:'udemy',          cost:499,  rating:4.7, duration:'18 hrs',  level:'Beginner',     skills:['excel','finance','accounting'],           role:['Accountant','Financial Analyst','Business Analyst'] },
  { id:21, title:'Financial Accounting – NPTEL',       platform:'nptel',          cost:0,    rating:4.5, duration:'8 weeks', level:'Beginner',     skills:['accounting','finance','tally'],           role:['Accountant','Financial Analyst'] },
  // Swayam / Govt
  { id:22, title:'Ethics in Engineering – Swayam',     platform:'swayam',         cost:0,    rating:4.3, duration:'8 weeks', level:'Beginner',     skills:['engineering','ethics'],                  role:['Civil Engineer'] },
  { id:23, title:'Digital Fluency – Swayam',           platform:'swayam',         cost:0,    rating:4.2, duration:'4 weeks', level:'Beginner',     skills:['digital','basics','government'],          role:['Government Job (SSC/UPSC)'] },
  // Internshala
  { id:24, title:'Core Java – Internshala',            platform:'internshala',    cost:999,  rating:4.5, duration:'6 hrs',   level:'Beginner',     skills:['java','programming'],                    role:['Software Developer'] },
  { id:25, title:'Digital Marketing – Internshala',    platform:'internshala',    cost:799,  rating:4.4, duration:'10 hrs',  level:'Beginner',     skills:['digital marketing','seo'],               role:['Digital Marketer'] },
]

const COURSE_URLS = {
  1:'https://www.youtube.com/watch?v=HXV3zeQKqGY', 2:'https://www.youtube.com/watch?v=vmEHCJofslg',
  5:'https://www.coursera.org/professional-certificates/google-data-analytics',
  6:'https://nptel.ac.in/courses/106106212', 9:'https://www.youtube.com/watch?v=b9eMGE7QtTk',
  18:'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce',
}

export default function Courses() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [activePlatform, setActivePlatform] = useState('all')
  const [costFilter, setCostFilter] = useState('all')
  const [selectedBudgetTile, setSelectedBudgetTile] = useState(null) // null = no filter
  const [enrolled, setEnrolled] = useState(new Set())

  useEffect(()=>{ loadEnrolled() }, [profile])

  async function loadEnrolled() {
    if (!profile?.id) return
    const { data } = await supabase.from('course_selections').select('course_name').eq('user_id',profile.id).eq('is_enrolled',true)
    if (data) setEnrolled(new Set(data.map(c=>c.course_name)))
  }

  async function toggleEnroll(course) {
    if (!profile?.id) return
    if (enrolled.has(course.title)) {
      await supabase.from('course_selections').delete().eq('user_id',profile.id).eq('course_name',course.title)
      setEnrolled(prev=>{ const s=new Set(prev); s.delete(course.title); return s })
    } else {
      await supabase.from('course_selections').insert({ user_id:profile.id, course_name:course.title, platform:course.platform, cost_inr:course.cost, url:COURSE_URLS[course.id]||'#', is_enrolled:true, enrolled_at:new Date().toISOString() })
      setEnrolled(prev=>new Set([...prev,course.title]))
    }
  }

  const budgetMax = useMemo(() => {
    if (!selectedBudgetTile) return 99999
    const tile = BUDGET_TILES.find(b => b.value === selectedBudgetTile)
    return tile ? tile.max : 99999
  }, [selectedBudgetTile])

  const filtered = useMemo(()=>{
    const q = search.toLowerCase().trim()
    return ALL_COURSES.filter(course=>{
      const matchSearch = !q ||
        course.title.toLowerCase().includes(q) ||
        course.skills.some(s => s.toLowerCase().includes(q)) ||
        course.level.toLowerCase().includes(q)
      const matchPlatform = activePlatform==='all' || course.platform===activePlatform
      const matchCost = costFilter==='all' ? true : costFilter==='free' ? course.cost===0 : course.cost>0
      const matchBudget = selectedBudgetTile === null || course.cost <= budgetMax
      const matchRole = !q && profile?.aspiration ? course.role.includes(profile.aspiration) : true
      return matchSearch && matchPlatform && matchCost && matchBudget && matchRole
    })
  }, [search, activePlatform, costFilter, selectedBudgetTile, budgetMax, profile])

  const totalEnrolledCost = [...enrolled].reduce((s,title)=>{ const c=ALL_COURSES.find(x=>x.title===title); return s+(c?.cost||0) },0)

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="page-container">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <h1 className="section-title" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}><BookOpen size={20} color="var(--success)"/> Courses</h1>
            <p className="text-muted">Goal: <strong>{profile?.aspiration||'General'}</strong> · {enrolled.size>0 && <span style={{color:'var(--success)'}}>{enrolled.size} saved · {totalEnrolledCost===0?'Free':`₹${totalEnrolledCost.toLocaleString('en-IN')}`}</span>}</p>
          </div>
        </div>

        {/* Budget tiles — replaces budget field */}
        <div style={{marginBottom:'1.25rem'}}>
          <p style={{fontSize:'12px',fontWeight:'600',color:'var(--gray-500)',marginBottom:'8px',textTransform:'uppercase',letterSpacing:'.05em'}}>Choose your learning budget</p>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            {BUDGET_TILES.map(t=>(
              <div key={t.value} onClick={()=>{ setSelectedBudgetTile(prev => prev===t.value ? null : t.value) }}
                style={{padding:'8px 14px',border:`1.5px solid ${selectedBudgetTile===t.value?'var(--brand)':'var(--gray-200)'}`,borderRadius:'var(--radius-md)',cursor:'pointer',background:selectedBudgetTile===t.value?'var(--brand-light)':'#fff',transition:'all .15s',textAlign:'center',userSelect:'none'}}>
                <p style={{fontSize:'13px',fontWeight:'600',color:selectedBudgetTile===t.value?'var(--brand)':'var(--gray-700)'}}>{t.label}</p>
                <p style={{fontSize:'11px',color:'var(--gray-400)',marginTop:'2px'}}>{t.tag}</p>
              </div>
            ))}
            {selectedBudgetTile && <button onClick={()=>setSelectedBudgetTile(null)} className="btn btn-ghost btn-sm" style={{alignSelf:'center'}}>Clear</button>}
          </div>
        </div>

        {/* Search + filters */}
        <div style={{display:'flex',gap:'8px',marginBottom:'1rem',flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:'180px'}}>
            <Search size={14} style={{position:'absolute',left:'10px',top:'50%',transform:'translateY(-50%)',color:'var(--gray-400)'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by skill — 'front end', 'Python', 'SQL'…" style={{paddingLeft:'32px'}}/>
          </div>
          <select value={costFilter} onChange={e=>setCostFilter(e.target.value)} style={{width:'auto',minWidth:'110px'}}>
            <option value="all">Free + Paid</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
        </div>

        {/* Platform chips */}
        <div style={{display:'flex',gap:'6px',marginBottom:'1.5rem',flexWrap:'wrap'}}>
          <span className={`chip ${activePlatform==='all'?'active':''}`} onClick={()=>setActivePlatform('all')}>All</span>
          {Object.entries(PLATFORM_CONFIG).map(([k,v])=>(
            <span key={k} className={`chip ${activePlatform===k?'active':''}`} onClick={()=>setActivePlatform(activePlatform===k?'all':k)}>
              {v.icon} {v.label}
            </span>
          ))}
        </div>

        {filtered.length===0 ? (
          <div className="card" style={{textAlign:'center',padding:'3rem',color:'var(--gray-400)'}}>
            <p style={{fontSize:'32px',marginBottom:'1rem'}}>📚</p>
            <p>No courses found. Try a different skill, platform, or increase your budget range.</p>
          </div>
        ) : (
          <>
            <p style={{fontSize:'13px',color:'var(--gray-500)',marginBottom:'1rem'}}>{filtered.length} courses found</p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
              {filtered.map(course=>{
                const p = PLATFORM_CONFIG[course.platform]
                const isEnrolled = enrolled.has(course.title)
                return (
                  <div key={course.id} className="card" style={{display:'flex',flexDirection:'column',gap:'.75rem',border:isEnrolled?'1.5px solid var(--success)':'1px solid var(--gray-200)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:'11px',fontWeight:'600',padding:'3px 8px',borderRadius:'20px',background:p.bg,color:p.color}}>{p.icon} {p.label}</span>
                      <span className={`badge ${course.cost===0?'badge-green':'badge-yellow'}`}>{course.cost===0?'Free':`₹${course.cost}`}</span>
                    </div>
                    <h3 style={{fontSize:'14px',fontWeight:'600',color:'var(--gray-900)',lineHeight:'1.4'}}>{course.title}</h3>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                      {course.skills.slice(0,3).map(s=><span key={s} className="badge badge-gray">{s}</span>)}
                    </div>
                    <div style={{display:'flex',gap:'10px',fontSize:'12px',color:'var(--gray-400)'}}>
                      <span>⏱ {course.duration}</span><span>⭐ {course.rating}</span><span>📊 {course.level}</span>
                    </div>
                    <div style={{display:'flex',gap:'8px',marginTop:'auto'}}>
                      {COURSE_URLS[course.id] && (
                        <a href={COURSE_URLS[course.id]} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{flex:1,justifyContent:'center'}}>
                          View <ExternalLink size={12}/>
                        </a>
                      )}
                      <button onClick={()=>toggleEnroll(course)} className={`btn btn-sm ${isEnrolled?'btn-outline':'btn-primary'}`} style={{flex:1,justifyContent:'center'}}>
                        {isEnrolled?'✓ Saved':'+ Save'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
