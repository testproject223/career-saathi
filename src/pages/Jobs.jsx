import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import { Briefcase, ExternalLink, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import CitySelect from '../components/ui/CitySelect'

const SALARY_MAP = {
  'Data Analyst':'₹3L–₹8L','Software Developer':'₹4L–₹12L','Data Scientist':'₹5L–₹14L',
  'Web Developer':'₹3L–₹9L','Product Manager':'₹10L–₹25L','Digital Marketer':'₹2.5L–₹6L',
  'Business Analyst':'₹4L–₹10L','HR Manager':'₹3L–₹8L','Accountant':'₹2.5L–₹6L',
  'Financial Analyst':'₹4L–₹10L','Content Writer':'₹2L–₹5L','default':'₹2L–₹8L',
}

const GOVT_JOBS = [
  { id:'g1', title:'SSC CGL – Combined Graduate Level', company:'Staff Selection Commission', location:'Pan India', salary:'₹4.4L–₹7L', type:'Government', posted:5, url:'https://ssc.nic.in', match:88, desc:'Group B & C posts across central govt. Graduates eligible. Written + skill test.' },
  { id:'g2', title:'IBPS PO – Probationary Officer', company:'IBPS', location:'Pan India', salary:'₹5.2L–₹8L', type:'Government', posted:3, url:'https://www.ibps.in', match:82, desc:'Banking PO posts. Graduates eligible. Prelims + Mains + Interview.' },
  { id:'g3', title:'UPSC Civil Services', company:'UPSC', location:'Pan India', salary:'₹9L–₹18L', type:'Government', posted:10, url:'https://upsc.gov.in', match:75, desc:'IAS/IPS/IFS. Most prestigious exam. Prelims + Mains + Interview.' },
  { id:'g4', title:'RBI Grade B Officer', company:'Reserve Bank of India', location:'Pan India', salary:'₹12L–₹15L', type:'Government', posted:7, url:'https://www.rbi.org.in', match:78, desc:'Phase I + II + Interview. Graduates with 60% eligible.' },
]

const COMPANIES = ['TCS','Infosys','Wipro','Accenture','Deloitte','Cognizant','HCL',
  'Amazon India','Flipkart','Razorpay','Zomato','Swiggy','Meesho','Paytm','PhonePe',
  'BYJU\'S','Ola','Nykaa','Freshworks','Zoho','MakeMyTrip']

function makeJobs(role, city, expSlab) {
  const cities = city && city !== 'India'
    ? [city, 'Bangalore', 'Mumbai', 'Hyderabad', 'Pune']
    : ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi NCR', 'Noida', 'Gurugram']
  const salary = SALARY_MAP[role] || SALARY_MAP['default']
  const levels = {
    '0-2':  ['Fresher', 'Junior', 'Trainee'],
    '2-5':  ['Junior', 'Mid-level', ''],
    '5-8':  ['Senior', 'Lead', 'Senior'],
    '8-12': ['Senior Manager', 'Director', 'VP'],
    '12+':  ['VP', 'Director', 'CXO'],
  }
  const lvls = levels[expSlab] || levels['0-2']
  return Array.from({ length: 12 }, (_, i) => ({
    id: `j${i}`,
    title: i < 3 ? role : `${lvls[i % lvls.length]} ${role}`.trim(),
    company: COMPANIES[i % COMPANIES.length],
    location: cities[i % cities.length],
    salary,
    type: ['Full-time','Hybrid','Remote','Contract'][i % 4],
    posted: [1,2,3,5,7,10,14][i % 7],
    url: `https://in.indeed.com/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(city || 'India')}`,
    match: Math.max(58, 94 - i * 3),
  }))
}

export default function Jobs() {
  const { profile } = useAuth()
  const [roleSearch, setRoleSearch] = useState('')
  const [city, setCity] = useState('')
  const [sector, setSector] = useState('private')
  const [allJobs, setAllJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState(new Set())

  useEffect(() => {
    if (profile) {
      setRoleSearch(profile.aspiration || '')
      setCity(profile.city || '')
      setSector(profile.sector || 'private')
      setAllJobs(makeJobs(profile.aspiration || 'Software Developer', profile.city || 'India', profile.experience_slab || '0-2'))
    }
  }, [profile?.aspiration])

  function doSearch() {
    setAllJobs(makeJobs(roleSearch || profile?.aspiration || 'Software Developer', city, profile?.experience_slab || '0-2'))
  }

  // Filter: title-only match
  const filtered = useMemo(() => {
    const q = roleSearch.toLowerCase().trim()
    return allJobs.filter(j => !q || j.title.toLowerCase().includes(q))
  }, [allJobs, roleSearch])

  async function toggleSave(job) {
    if (!profile?.id) return
    if (savedJobs.has(job.id)) {
      await supabase.from('saved_jobs').delete().eq('user_id', profile.id).eq('job_title', job.title).eq('company', job.company)
      setSavedJobs(prev => { const s = new Set(prev); s.delete(job.id); return s })
    } else {
      await supabase.from('saved_jobs').insert({ user_id: profile.id, job_title: job.title, company: job.company, location: job.location, salary_range: job.salary, source: 'Indeed', apply_url: job.url, match_score: job.match })
      setSavedJobs(prev => new Set([...prev, job.id]))
    }
  }

  const matchColor = m => m >= 85 ? 'var(--success)' : m >= 70 ? 'var(--warning)' : 'var(--gray-400)'

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container">
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Briefcase size={20} color="var(--brand)" /> Job Opportunities
          </h1>
          <p className="text-muted">Auto-matched · Indeed · Naukri · Internshala · Govt portals</p>
        </div>

        {/* Sector toggle */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500' }}>Sector:</span>
          {[['private','🏢 Private'],['govt','🏛 Government'],['both','🔀 Both']].map(([s,l]) => (
            <span key={s} className={`chip ${sector === s ? 'active' : ''}`} onClick={() => setSector(s)}>{l}</span>
          ))}
        </div>

        {/* Search row */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '160px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input
              value={roleSearch}
              onChange={e => setRoleSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
              placeholder="Job title…"
              style={{ paddingLeft: '32px' }}
            />
          </div>
          <CitySelect value={city} onChange={setCity} />
          <button onClick={doSearch} className="btn btn-primary">
            <Search size={14} /> Search
          </button>
        </div>

        {/* External portals */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Indeed', url: `https://in.indeed.com/jobs?q=${encodeURIComponent(roleSearch)}&l=${encodeURIComponent(city)}`, color: 'var(--brand)' },
            { label: 'Naukri', url: `https://www.naukri.com/${roleSearch.toLowerCase().replace(/ /g,'-')}-jobs`, color: '#f97316' },
            { label: 'Internshala', url: `https://internshala.com/jobs/${roleSearch.toLowerCase().replace(/ /g,'-')}-jobs`, color: 'var(--success)' },
            { label: 'NCS Portal', url: 'https://www.ncs.gov.in', color: '#7c3aed' },
          ].map(({ label, url, color }) => (
            <a key={label} href={url} target="_blank" rel="noreferrer"
              className="chip" style={{ color, borderColor: color, textDecoration: 'none' }}>
              {label} <ExternalLink size={11} />
            </a>
          ))}
        </div>

        {/* Govt jobs */}
        {(sector === 'govt' || sector === 'both') && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem' }}>🏛 Government opportunities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
              {GOVT_JOBS.map(job => (
                <div key={job.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>{job.title}</p>
                      <p style={{ fontSize: '13px', color: 'var(--brand)' }}>{job.company}</p>
                    </div>
                    <span className="badge badge-blue" style={{ flexShrink: 0, marginLeft: '8px' }}>{job.match}%</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '8px' }}>
                    📍 {job.location} &nbsp;💰 {job.salary}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: '1.5', marginBottom: '10px' }}>{job.desc}</p>
                  <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>
                    Apply <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Private jobs */}
        {(sector === 'private' || sector === 'both') && (
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '.75rem' }}>🏢 Private sector jobs</h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              {filtered.length} matched roles
              {savedJobs.size > 0 && <span style={{ color: 'var(--success)', marginLeft: '10px' }}>· {savedJobs.size} saved</span>}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
              {filtered.map(job => (
                <div key={job.id} className="card" style={{ border: savedJobs.has(job.id) ? '1.5px solid var(--success)' : '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '3px' }}>{job.title}</p>
                      <p style={{ fontSize: '13px', color: 'var(--brand)' }}>{job.company}</p>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: matchColor(job.match), background: `${matchColor(job.match)}18`, padding: '3px 8px', borderRadius: '12px', flexShrink: 0, marginLeft: '8px' }}>
                      {job.match}%
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '10px' }}>
                    📍 {job.location} &nbsp;💰 {job.salary} &nbsp;
                    <span className="badge badge-gray">{job.type}</span> &nbsp;
                    🕐 {job.posted}d ago
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => toggleSave(job)} className={`btn btn-sm ${savedJobs.has(job.id) ? 'btn-outline' : 'btn-ghost'}`} style={{ flex: 1, justifyContent: 'center' }}>
                      {savedJobs.has(job.id) ? '✓ Saved' : '🔖 Save'}
                    </button>
                    <a href={job.url} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      Apply <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
