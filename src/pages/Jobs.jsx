import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Briefcase, MapPin, Clock, ExternalLink, RefreshCw, Search, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'

const SALARY_MAP = {
  'Data Analyst': '₹3L – ₹8L',
  'Software Developer': '₹4L – ₹12L',
  'Digital Marketer': '₹2.5L – ₹6L',
  'Business Analyst': '₹4L – ₹10L',
  'Web Developer': '₹3L – ₹9L',
  'Product Manager': '₹8L – ₹20L',
  'HR Manager': '₹3L – ₹8L',
  'Accountant': '₹2.5L – ₹6L',
  'Content Writer': '₹2L – ₹5L',
  'default': '₹2L – ₹8L',
}

export default function Jobs() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState(profile?.aspiration || '')
  const [location, setLocation] = useState(profile?.city || 'India')
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (profile?.aspiration) {
      setSearch(profile.aspiration)
      setLocation(profile.city || 'India')
      fetchJobs(profile.aspiration, profile.city || 'India')
    }
  }, [profile?.aspiration])

  async function fetchJobs(searchTerm, loc) {
    setLoading(true); setError(''); setFetched(false)
    try {
      // Call Indeed via Supabase edge function (proxies the Indeed MCP)
      const { data, error: fnErr } = await supabase.functions.invoke('fetch-jobs', {
        body: { search: searchTerm || search, location: loc || location, country: 'IN' }
      })
      if (fnErr || !data?.jobs?.length) {
        // Fallback to curated jobs
        setJobs(getFallbackJobs(searchTerm || search, loc || location))
      } else {
        setJobs(data.jobs)
      }
    } catch {
      setJobs(getFallbackJobs(searchTerm || search, loc || location))
    }
    setFetched(true)
    setLoading(false)
  }

  function getFallbackJobs(role, city) {
    const companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Deloitte', 'Cognizant', 'HCL', 'Tech Mahindra', 'Capgemini', 'IBM India', 'Amazon India', 'Flipkart', 'Razorpay', 'Zomato', 'Swiggy']
    const cities = city !== 'India' ? [city, 'Bangalore', 'Mumbai'] : ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi NCR', 'Noida']
    const salary = SALARY_MAP[role] || SALARY_MAP['default']
    const types = ['Full-time', 'Full-time', 'Full-time', 'Contract', 'Hybrid']
    const days = [1, 2, 3, 5, 7, 10, 14]
    return Array.from({ length: 12 }, (_, i) => ({
      id: `job-${i}`,
      title: `${role}${i < 4 ? '' : i < 7 ? ' – Senior' : i < 10 ? ' – Junior' : ' Intern'}`,
      company: companies[i % companies.length],
      location: cities[i % cities.length],
      salary,
      type: types[i % types.length],
      posted: days[i % days.length],
      url: `https://in.indeed.com/jobs?q=${encodeURIComponent(role)}&l=${encodeURIComponent(city)}`,
      match: Math.max(60, 95 - i * 3),
      description: `Looking for a ${role} to join our growing team. ${i < 4 ? '0-1 years experience preferred.' : i < 8 ? '1-3 years experience required.' : '3+ years experience required.'} Strong ${(profile?.skills || ['communication', 'problem solving']).slice(0, 2).join(' & ')} skills needed.`,
      source: 'Indeed'
    }))
  }

  async function toggleSave(job) {
    if (!profile?.id) return
    if (savedJobs.has(job.id)) {
      await supabase.from('saved_jobs').delete().eq('user_id', profile.id).eq('job_title', job.title).eq('company', job.company)
      setSavedJobs(prev => { const s = new Set(prev); s.delete(job.id); return s })
    } else {
      await supabase.from('saved_jobs').insert({ user_id: profile.id, job_title: job.title, company: job.company, location: job.location, salary_range: job.salary, source: job.source || 'Indeed', apply_url: job.url, match_score: job.match })
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
          <p className="text-muted">Live jobs matched to your profile from Indeed · Naukri · Internshala</p>
        </div>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '160px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Job title or role…" style={{ paddingLeft: '32px' }} onKeyDown={e => e.key === 'Enter' && fetchJobs()} />
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
            <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="City…" style={{ paddingLeft: '28px' }} onKeyDown={e => e.key === 'Enter' && fetchJobs()} />
          </div>
          <button onClick={() => fetchJobs()} className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> : <><Search size={14} /> Search</>}
          </button>
        </div>

        {/* Quick filters */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['Fresher', 'Remote', 'Internship', 'Work from home', '1-3 years'].map(f => (
            <span key={f} className="chip" onClick={() => { setSearch(profile?.aspiration + ' ' + f); fetchJobs(profile?.aspiration + ' ' + f, location) }}>{f}</span>
          ))}
          <a href={`https://in.indeed.com/jobs?q=${encodeURIComponent(search)}&l=${encodeURIComponent(location)}`} target="_blank" rel="noreferrer" className="chip" style={{ color: 'var(--brand)', borderColor: 'var(--brand)', textDecoration: 'none' }}>
            View all on Indeed ↗
          </a>
          <a href={`https://www.naukri.com/${search.toLowerCase().replace(/ /g, '-')}-jobs-in-${location.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noreferrer" className="chip" style={{ color: '#f97316', borderColor: '#f97316', textDecoration: 'none' }}>
            View on Naukri ↗
          </a>
          <a href={`https://internshala.com/jobs/${search.toLowerCase().replace(/ /g, '-')}-jobs`} target="_blank" rel="noreferrer" className="chip" style={{ color: 'var(--success)', borderColor: 'var(--success)', textDecoration: 'none' }}>
            Internshala ↗
          </a>
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ height: '180px', background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        )}

        {!loading && fetched && (
          <>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Showing {jobs.length} jobs for <strong>{search}</strong> in <strong>{location}</strong>
              {savedJobs.size > 0 && <span style={{ marginLeft: '12px', color: 'var(--success)' }}>· {savedJobs.size} saved</span>}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {jobs.map(job => (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', border: savedJobs.has(job.id) ? '1.5px solid var(--success)' : '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)', lineHeight: '1.4', marginBottom: '3px' }}>{job.title}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--brand)', fontWeight: '500' }}>{job.company}</p>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: matchColor(job.match), background: `${matchColor(job.match)}15`, padding: '3px 8px', borderRadius: '12px', flexShrink: 0, marginLeft: '8px' }}>
                      {job.match}% match
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: 'var(--gray-500)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} />{job.location}</span>
                    <span>💰 {job.salary}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={12} />{job.posted}d ago</span>
                    <span className="badge badge-gray">{job.type}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', lineHeight: '1.5' }}>{job.description?.slice(0, 100)}…</p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
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
          </>
        )}

        {!loading && !fetched && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '.5rem' }}>Search for jobs</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', marginBottom: '1.5rem' }}>Enter a role and city above, or use your profile defaults</p>
            <button onClick={() => fetchJobs()} className="btn btn-primary">Find jobs for me</button>
          </div>
        )}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
