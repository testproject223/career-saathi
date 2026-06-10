import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { BookOpen, ExternalLink, Youtube, Star, Clock, DollarSign, Filter, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Course data sourced from public APIs and curated lists
// YouTube: Free via Data API v3
// Coursera: Public catalog API (no auth needed for search)
// NPTEL: Public courses
// Great Learning: Curated free courses
// Udemy: Public course data

const PLATFORM_CONFIG = {
  youtube:        { label: 'YouTube',       color: '#ff0000', bg: '#fff0f0', icon: '▶' },
  coursera:       { label: 'Coursera',      color: '#0056d2', bg: '#f0f4ff', icon: '🎓' },
  nptel:          { label: 'NPTEL',         color: '#1a73e8', bg: '#e8f0fe', icon: '🏛' },
  great_learning: { label: 'Great Learning',color: '#7b2d8b', bg: '#f5e6ff', icon: '📚' },
  udemy:          { label: 'Udemy',         color: '#a435f0', bg: '#f3e8ff', icon: '🎯' },
  internshala:    { label: 'Internshala',   color: '#009b77', bg: '#e6f7f3', icon: '💼' },
}

// Curated course database by career + skill
const COURSE_DB = {
  'Data Analyst': [
    { id: 1, title: 'SQL Tutorial - Full Database Course', platform: 'youtube', channel: 'freeCodeCamp', duration: '4.5 hrs', cost: 0, rating: 4.8, url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', skills: ['SQL'], level: 'Beginner' },
    { id: 2, title: 'Python for Data Analysis', platform: 'youtube', channel: 'Keith Galli', duration: '6 hrs', cost: 0, rating: 4.7, url: 'https://www.youtube.com/watch?v=vmEHCJofslg', skills: ['Python', 'Pandas'], level: 'Beginner' },
    { id: 3, title: 'Google Data Analytics Certificate', platform: 'coursera', channel: 'Google', duration: '6 months', cost: 3200, rating: 4.8, url: 'https://www.coursera.org/professional-certificates/google-data-analytics', skills: ['SQL', 'R', 'Tableau', 'Excel'], level: 'Beginner' },
    { id: 4, title: 'Data Analysis using Python - NPTEL', platform: 'nptel', channel: 'IIT', duration: '8 weeks', cost: 0, rating: 4.6, url: 'https://nptel.ac.in/courses/106106212', skills: ['Python', 'NumPy', 'Pandas'], level: 'Intermediate' },
    { id: 5, title: 'Data Analytics Free Course', platform: 'great_learning', channel: 'Great Learning', duration: '40 hrs', cost: 0, rating: 4.5, url: 'https://www.mygreatlearning.com/data-analytics/free-courses', skills: ['Excel', 'SQL', 'Python'], level: 'Beginner' },
    { id: 6, title: 'Microsoft Excel - Excel from Beginner to Advanced', platform: 'udemy', channel: 'Kyle Pew', duration: '18 hrs', cost: 499, rating: 4.7, url: 'https://www.udemy.com/course/microsoft-excel-2013-from-beginner-to-advanced-and-beyond/', skills: ['Excel'], level: 'Beginner' },
    { id: 7, title: 'Tableau 2024 A-Z: Hands-On Tableau Training', platform: 'udemy', channel: 'Kirill Eremenko', duration: '8 hrs', cost: 699, rating: 4.6, url: 'https://www.udemy.com/course/tableau10/', skills: ['Tableau', 'Visualization'], level: 'Beginner' },
    { id: 8, title: 'Statistics for Data Science', platform: 'youtube', channel: '365 Data Science', duration: '3 hrs', cost: 0, rating: 4.5, url: 'https://www.youtube.com/watch?v=xxpc-HPKN28', skills: ['Statistics'], level: 'Beginner' },
  ],
  'Software Developer': [
    { id: 9, title: 'Full Stack Web Dev - The Complete Bootcamp', platform: 'udemy', channel: 'Angela Yu', duration: '55 hrs', cost: 999, rating: 4.8, url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/', skills: ['HTML', 'CSS', 'JavaScript', 'Node.js'], level: 'Beginner' },
    { id: 10, title: 'CS50: Introduction to Computer Science', platform: 'coursera', channel: 'Harvard', duration: '12 weeks', cost: 0, rating: 4.9, url: 'https://www.edx.org/course/introduction-computer-science-harvardx-cs50x', skills: ['C', 'Python', 'SQL', 'JavaScript'], level: 'Beginner' },
    { id: 11, title: 'React JS Full Course', platform: 'youtube', channel: 'freeCodeCamp', duration: '12 hrs', cost: 0, rating: 4.8, url: 'https://www.youtube.com/watch?v=b9eMGE7QtTk', skills: ['React', 'JavaScript'], level: 'Intermediate' },
    { id: 12, title: 'Programming in Java - NPTEL', platform: 'nptel', channel: 'IIT Kharagpur', duration: '12 weeks', cost: 0, rating: 4.7, url: 'https://nptel.ac.in/courses/106105191', skills: ['Java', 'OOP'], level: 'Beginner' },
    { id: 13, title: 'DSA - Data Structures & Algorithms', platform: 'youtube', channel: 'Abdul Bari', duration: '25 hrs', cost: 0, rating: 4.9, url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', skills: ['DSA', 'Problem Solving'], level: 'Intermediate' },
    { id: 14, title: 'Python Bootcamp', platform: 'great_learning', channel: 'Great Learning', duration: '30 hrs', cost: 0, rating: 4.5, url: 'https://www.mygreatlearning.com/python/free-courses', skills: ['Python'], level: 'Beginner' },
  ],
  'Digital Marketer': [
    { id: 15, title: 'Digital Marketing Full Course', platform: 'youtube', channel: 'Simplilearn', duration: '8 hrs', cost: 0, rating: 4.6, url: 'https://www.youtube.com/watch?v=hiEFCBWGS4E', skills: ['SEO', 'SEM', 'Social Media'], level: 'Beginner' },
    { id: 16, title: 'Google Digital Marketing Certificate', platform: 'coursera', channel: 'Google', duration: '6 months', cost: 3200, rating: 4.7, url: 'https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce', skills: ['SEO', 'Analytics', 'Ads'], level: 'Beginner' },
    { id: 17, title: 'Social Media Marketing - Free Course', platform: 'great_learning', channel: 'Great Learning', duration: '20 hrs', cost: 0, rating: 4.4, url: 'https://www.mygreatlearning.com/social-media-marketing/free-courses', skills: ['Social Media', 'Content'], level: 'Beginner' },
    { id: 18, title: 'SEO Training Course', platform: 'udemy', channel: 'Moz', duration: '10 hrs', cost: 499, rating: 4.5, url: 'https://www.udemy.com/course/whiteboard-seo-course/', skills: ['SEO'], level: 'Beginner' },
  ],
  'default': [
    { id: 19, title: 'Communication Skills - Free Course', platform: 'great_learning', channel: 'Great Learning', duration: '10 hrs', cost: 0, rating: 4.4, url: 'https://www.mygreatlearning.com/communication-skills/free-courses', skills: ['Communication'], level: 'Beginner' },
    { id: 20, title: 'MS Excel Full Course', platform: 'youtube', channel: 'Learnit Training', duration: '3 hrs', cost: 0, rating: 4.6, url: 'https://www.youtube.com/watch?v=Vl0H-qTclOg', skills: ['Excel'], level: 'Beginner' },
    { id: 21, title: 'Learn Python - Full Course', platform: 'youtube', channel: 'freeCodeCamp', duration: '4.5 hrs', cost: 0, rating: 4.8, url: 'https://www.youtube.com/watch?v=rfscVS0vtbw', skills: ['Python'], level: 'Beginner' },
    { id: 22, title: 'Introduction to AI - Free', platform: 'great_learning', channel: 'Great Learning', duration: '8 hrs', cost: 0, rating: 4.5, url: 'https://www.mygreatlearning.com/artificial-intelligence/free-courses', skills: ['AI', 'ML'], level: 'Beginner' },
  ],
  'Business Analyst': [
    { id: 23, title: 'Business Analysis Fundamentals', platform: 'udemy', channel: 'Jeremy Aschenbrenner', duration: '8 hrs', cost: 599, rating: 4.5, url: 'https://www.udemy.com/course/business-analysis-ba/', skills: ['Requirements', 'Process Mapping'], level: 'Beginner' },
    { id: 24, title: 'Power BI Full Course', platform: 'youtube', channel: 'Guy in a Cube', duration: '6 hrs', cost: 0, rating: 4.7, url: 'https://www.youtube.com/watch?v=TmhQCQr_DCA', skills: ['Power BI', 'Visualization'], level: 'Beginner' },
    { id: 25, title: 'SQL for Business Analysts', platform: 'coursera', channel: 'University of Colorado', duration: '4 weeks', cost: 0, rating: 4.6, url: 'https://www.coursera.org/learn/analytics-mysql', skills: ['SQL'], level: 'Beginner' },
  ],
}

export default function Courses() {
  const { profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [costFilter, setCostFilter] = useState('all')
  const [enrolled, setEnrolled] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
    loadEnrolled()
  }, [profile])

  function loadCourses() {
    const aspiration = profile?.aspiration || 'default'
    const base = COURSE_DB[aspiration] || COURSE_DB['default']
    // Always include default courses too
    const defaults = COURSE_DB['default'].filter(d => !base.find(b => b.id === d.id))
    const budget = profile?.budget_inr || 0
    let all = [...base, ...defaults]
    // Filter by budget
    if (budget === 0) all = all.filter(c => c.cost === 0)
    else all = all.filter(c => c.cost <= budget)
    setCourses(all)
    setFiltered(all)
    setLoading(false)
  }

  async function loadEnrolled() {
    if (!profile?.id) return
    const { data } = await supabase
      .from('course_selections')
      .select('course_name')
      .eq('user_id', profile.id)
      .eq('is_enrolled', true)
    if (data) setEnrolled(new Set(data.map(c => c.course_name)))
  }

  async function toggleEnroll(course) {
    if (!profile?.id) return
    const isEnrolled = enrolled.has(course.title)
    if (isEnrolled) {
      await supabase.from('course_selections').delete()
        .eq('user_id', profile.id).eq('course_name', course.title)
      setEnrolled(prev => { const s = new Set(prev); s.delete(course.title); return s })
    } else {
      await supabase.from('course_selections').insert({
        user_id: profile.id,
        course_name: course.title,
        platform: course.platform,
        cost_inr: course.cost,
        url: course.url,
        is_enrolled: true,
        enrolled_at: new Date().toISOString()
      })
      setEnrolled(prev => new Set([...prev, course.title]))
    }
  }

  useEffect(() => {
    let result = courses
    if (search) result = result.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    )
    if (platformFilter !== 'all') result = result.filter(c => c.platform === platformFilter)
    if (costFilter === 'free') result = result.filter(c => c.cost === 0)
    if (costFilter === 'paid') result = result.filter(c => c.cost > 0)
    setFiltered(result)
  }, [search, platformFilter, costFilter, courses])

  const totalCost = [...enrolled].reduce((sum, title) => {
    const c = courses.find(x => x.title === title)
    return sum + (c?.cost || 0)
  }, 0)

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <BookOpen size={20} color="var(--success)" /> Courses
            </h1>
            <p className="text-muted">Matched to your goal: <strong>{profile?.aspiration || 'General'}</strong> · Budget: <strong>{profile?.budget_inr === 0 ? 'Free only' : `₹${profile?.budget_inr?.toLocaleString('en-IN')}`}</strong></p>
          </div>
          {enrolled.size > 0 && (
            <div style={{ background: 'var(--success-light)', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', padding: '.75rem 1rem', textAlign: 'right' }}>
              <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '600' }}>{enrolled.size} course{enrolled.size > 1 ? 's' : ''} saved</p>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>Total: {totalCost === 0 ? 'Free' : `₹${totalCost.toLocaleString('en-IN')}`}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses or skills…" style={{ paddingLeft: '32px' }} />
          </div>
          <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} style={{ width: 'auto', minWidth: '130px' }}>
            <option value="all">All platforms</option>
            {Object.entries(PLATFORM_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={costFilter} onChange={e => setCostFilter(e.target.value)} style={{ width: 'auto', minWidth: '110px' }}>
            <option value="all">Free + Paid</option>
            <option value="free">Free only</option>
            <option value="paid">Paid only</option>
          </select>
        </div>

        {/* Platform badges */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {Object.entries(PLATFORM_CONFIG).map(([k, v]) => (
            <span key={k} className={`chip ${platformFilter === k ? 'active' : ''}`} onClick={() => setPlatformFilter(platformFilter === k ? 'all' : k)}>
              {v.icon} {v.label}
            </span>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            No courses found. Try adjusting your filters or increasing your budget in your profile.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {filtered.map(course => {
              const p = PLATFORM_CONFIG[course.platform]
              const isEnrolled = enrolled.has(course.title)
              return (
                <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', border: isEnrolled ? '1.5px solid var(--success)' : '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: p.bg, color: p.color }}>
                      {p.icon} {p.label}
                    </span>
                    <span className={`badge ${course.cost === 0 ? 'badge-green' : 'badge-yellow'}`}>
                      {course.cost === 0 ? 'Free' : `₹${course.cost}`}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)', lineHeight: '1.4' }}>{course.title}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>by {course.channel}</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {course.skills.map(s => <span key={s} className="badge badge-gray">{s}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--gray-400)' }}>
                    <span>⏱ {course.duration}</span>
                    <span>⭐ {course.rating}</span>
                    <span>📊 {course.level}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <a href={course.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                      View <ExternalLink size={12} />
                    </a>
                    <button onClick={() => toggleEnroll(course)} className={`btn btn-sm ${isEnrolled ? 'btn-outline' : 'btn-primary'}`} style={{ flex: 1, justifyContent: 'center' }}>
                      {isEnrolled ? '✓ Saved' : 'Save course'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="card" style={{ marginTop: '1.5rem', background: 'var(--gray-50)', border: '1px dashed var(--gray-300)' }}>
          <p style={{ fontSize: '13px', color: 'var(--gray-500)', textAlign: 'center' }}>
            🔗 More platforms coming soon — <strong>Internshala</strong>, <strong>Swayam</strong>, <strong>LinkedIn Learning</strong> · 
            Update your budget in Profile to unlock paid courses
          </p>
        </div>
      </div>
    </div>
  )
}
