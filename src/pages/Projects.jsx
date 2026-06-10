import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Lightbulb, Github, ExternalLink, Star, GitFork, Plus, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

// Open source project recommendations by skill/role
const OPEN_SOURCE_DB = {
  'Data Analyst': [
    { name: 'pandas', org: 'pandas-dev', desc: 'Powerful data analysis library for Python — fix issues labelled "good first issue"', tags: ['Python', 'Data'], stars: '43k', url: 'https://github.com/pandas-dev/pandas/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 10 },
    { name: 'matplotlib', org: 'matplotlib', desc: 'Python plotting library — contribute chart types or fix rendering bugs', tags: ['Python', 'Visualization'], stars: '19k', url: 'https://github.com/matplotlib/matplotlib/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 15 },
    { name: 'kaggle-api', org: 'Kaggle', desc: 'Official Kaggle API — contribute scripts for data download and dataset management', tags: ['Python', 'SQL'], stars: '6k', url: 'https://github.com/Kaggle/kaggle-api/issues', difficulty: 'Beginner', score: 20 },
    { name: 'great-expectations', org: 'great-expectations', desc: 'Data validation library used at top companies — good for portfolio', tags: ['Python', 'Data Quality'], stars: '9k', url: 'https://github.com/great-expectations/great_expectations/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Intermediate', score: 30 },
    { name: 'superset', org: 'Apache', desc: 'Business intelligence dashboard used by Airbnb, Dropbox — add chart types', tags: ['Python', 'BI', 'SQL'], stars: '60k', url: 'https://github.com/apache/superset/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Intermediate', score: 40 },
  ],
  'Software Developer': [
    { name: 'freeCodeCamp', org: 'freeCodeCamp', desc: 'Largest open source codebase for learning — fix bugs, improve curriculum', tags: ['JavaScript', 'React'], stars: '390k', url: 'https://github.com/freeCodeCamp/freeCodeCamp/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 10 },
    { name: 'chakra-ui', org: 'chakra-ui', desc: 'Popular React component library — add components, fix accessibility', tags: ['React', 'TypeScript'], stars: '36k', url: 'https://github.com/chakra-ui/chakra-ui/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 20 },
    { name: 'expressjs', org: 'expressjs', desc: 'Node.js web framework — fix bugs, improve documentation', tags: ['Node.js', 'JavaScript'], stars: '62k', url: 'https://github.com/expressjs/express/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Intermediate', score: 30 },
    { name: 'react', org: 'facebook', desc: 'The React library itself — fix documentation or triaged bugs', tags: ['React', 'JavaScript'], stars: '220k', url: 'https://github.com/facebook/react/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Advanced', score: 50 },
    { name: 'supabase', org: 'supabase', desc: 'Open source Firebase alternative — JS client, CLI, docs', tags: ['TypeScript', 'PostgreSQL'], stars: '70k', url: 'https://github.com/supabase/supabase/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Intermediate', score: 35 },
  ],
  'Digital Marketer': [
    { name: 'plausible', org: 'plausible', desc: 'Privacy-friendly Google Analytics alternative — contribute dashboard features', tags: ['Analytics', 'Elixir'], stars: '18k', url: 'https://github.com/plausible/analytics/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 15 },
    { name: 'umami', org: 'umami-software', desc: 'Simple web analytics — improve reporting features', tags: ['Analytics', 'React'], stars: '21k', url: 'https://github.com/umami-software/umami/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 20 },
    { name: 'listmonk', org: 'knadh', desc: 'Self-hosted email marketing tool — add templates, improve campaigns', tags: ['Email Marketing', 'Go'], stars: '13k', url: 'https://github.com/knadh/listmonk/issues', difficulty: 'Intermediate', score: 30 },
  ],
  'Business Analyst': [
    { name: 'metabase', org: 'metabase', desc: 'Business intelligence tool — improve SQL editor, dashboards', tags: ['SQL', 'Java'], stars: '37k', url: 'https://github.com/metabase/metabase/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Intermediate', score: 25 },
    { name: 'redash', org: 'getredash', desc: 'Data querying tool — fix visualisation bugs, add data sources', tags: ['Python', 'SQL', 'React'], stars: '25k', url: 'https://github.com/getredash/redash/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Intermediate', score: 30 },
  ],
  'default': [
    { name: 'first-contributions', org: 'firstcontributions', desc: 'Perfect first PR — add your name to contributors list, learn git workflow', tags: ['Git', 'Any language'], stars: '42k', url: 'https://github.com/firstcontributions/first-contributions', difficulty: 'Beginner', score: 5 },
    { name: 'awesome-india', org: 'captn3m0', desc: 'Curated list of Indian open source projects — add projects, fix links', tags: ['Documentation'], stars: '3k', url: 'https://github.com/captn3m0/awesome-india', difficulty: 'Beginner', score: 5 },
    { name: 'public-apis', org: 'public-apis', desc: 'Huge list of free APIs — add new APIs, improve categorization', tags: ['Documentation'], stars: '300k', url: 'https://github.com/public-apis/public-apis/issues?q=is%3Aopen+label%3A%22good+first+issue%22', difficulty: 'Beginner', score: 10 },
  ]
}

const PROJECT_IDEAS_DB = {
  'Data Analyst': [
    { title: 'IPL Cricket Stats Dashboard', desc: 'Analyse 15 years of IPL data to find batting trends, team performance, and win probability', tech: 'Python, Pandas, Plotly', platform: 'Kaggle + GitHub', level: 'Beginner' },
    { title: 'India E-commerce Sales Analysis', desc: 'Analyse Flipkart/Amazon India sales patterns by category, region, and season', tech: 'Python, SQL, Power BI', platform: 'GitHub', level: 'Intermediate' },
    { title: 'Job Market Tracker India', desc: 'Scrape and analyse Naukri/LinkedIn job postings to find in-demand skills by city', tech: 'Python, BeautifulSoup, Tableau', platform: 'GitHub + Tableau Public', level: 'Intermediate' },
  ],
  'Software Developer': [
    { title: 'Bill Splitter App', desc: 'UPI-integrated expense splitter for groups, with history and settlement tracking', tech: 'React, Node.js, MongoDB', platform: 'GitHub + Vercel', level: 'Beginner' },
    { title: 'College Notes Sharing Platform', desc: 'Platform where students can upload/download notes by college, subject, semester', tech: 'React, Supabase, Tailwind', platform: 'GitHub + Vercel', level: 'Intermediate' },
    { title: 'Local Service Booking App', desc: 'Book local services (plumber, electrician) with OTP verification and ratings', tech: 'React Native, Firebase', platform: 'GitHub + Play Store', level: 'Advanced' },
  ],
  'default': [
    { title: 'Personal Portfolio Website', desc: 'Professional portfolio showcasing your projects, skills, resume, and contact info', tech: 'HTML, CSS, JavaScript', platform: 'GitHub Pages', level: 'Beginner' },
    { title: 'Budget Tracker', desc: 'Track monthly income and expenses with charts and savings goals', tech: 'Excel / Python / React', platform: 'GitHub', level: 'Beginner' },
  ]
}

const DIFFICULTY_COLOR = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' }

export default function Projects() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [selectedProjects, setSelectedProjects] = useState(new Set())
  const [tab, setTab] = useState('opensource') // opensource | ideas | myprojects

  const role = profile?.aspiration || 'default'
  const openSource = [...(OPEN_SOURCE_DB[role] || []), ...OPEN_SOURCE_DB['default']].filter((v, i, a) => a.findIndex(t => t.name === t.name) === i).slice(0, 6)
  const ideas = PROJECT_IDEAS_DB[role] || PROJECT_IDEAS_DB['default']
  const myProjects = profile?.projects || []

  function toggleSelect(name) {
    setSelectedProjects(prev => {
      const s = new Set(prev)
      s.has(name) ? s.delete(name) : s.add(name)
      return s
    })
  }

  function goToStartLearning() {
    navigate('/start-learning', { state: { selectedProjects: [...selectedProjects] } })
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Lightbulb size={20} color="var(--warning)" /> Project Ideas
            </h1>
            <p className="text-muted">Open source projects to contribute to + ideas based on your skills</p>
          </div>
          {selectedProjects.size > 0 && (
            <button onClick={goToStartLearning} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none' }}>
              🚀 Start Learning ({selectedProjects.size} selected)
            </button>
          )}
        </div>

        {/* My projects summary */}
        {myProjects.length > 0 && myProjects[0]?.name && (
          <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--brand-light)', border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--brand)', marginBottom: '.75rem' }}>📁 Your {myProjects.length} project{myProjects.length > 1 ? 's' : ''} from profile</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {myProjects.filter(p => p.name).map((p, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '.625rem .875rem', fontSize: '13px' }}>
                  <p style={{ fontWeight: '600', color: 'var(--gray-900)' }}>{p.name}</p>
                  {p.role && <p style={{ color: 'var(--gray-500)', fontSize: '12px' }}>{p.role}</p>}
                  {p.tech && <p style={{ color: 'var(--brand)', fontSize: '11px', marginTop: '3px' }}>{p.tech}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tab-bar">
          {[['opensource', '⭐ Open Source to Contribute'], ['ideas', '💡 Project Ideas'], ['myprojects', `📁 My Projects (${myProjects.filter(p=>p.name).length})`]].map(([id, label]) => (
            <button key={id} className={`tab-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'opensource' && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Contribute to these repos to build your GitHub profile. Select any to add to your <strong>Start Learning</strong> plan.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1rem' }}>
              {openSource.map(proj => {
                const selected = selectedProjects.has(proj.name)
                return (
                  <div key={proj.name} className="card" style={{ cursor: 'pointer', border: selected ? '1.5px solid var(--brand)' : '1px solid var(--gray-200)', transition: 'all .15s', position: 'relative' }}
                    onClick={() => toggleSelect(proj.name)}>
                    {selected && <div style={{ position: 'absolute', top: '12px', right: '12px' }}><CheckCircle size={18} color="var(--brand)" fill="var(--brand-light)" /></div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '.625rem' }}>
                      <Github size={16} color="var(--gray-700)" />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)' }}>{proj.org}/{proj.name}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5', marginBottom: '.75rem' }}>{proj.desc}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                      {proj.tags.map(t => <span key={t} className="badge badge-gray">{t}</span>)}
                      <span className={`badge ${DIFFICULTY_COLOR[proj.difficulty]}`}>{proj.difficulty}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--gray-400)' }}>
                        <span>⭐ {proj.stars}</span>
                        <span>+{proj.score} profile pts</span>
                      </div>
                      <a href={proj.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="btn btn-outline btn-sm">
                        View issues <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="card" style={{ marginTop: '1rem', background: 'var(--gray-50)', border: '1px dashed var(--gray-300)', textAlign: 'center', padding: '1rem' }}>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Find more: <a href="https://goodfirstissue.dev" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>goodfirstissue.dev</a> · <a href="https://up-for-grabs.net/#/" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>up-for-grabs.net</a> · <a href="https://hacktoberfest.com" target="_blank" rel="noreferrer" style={{ color: 'var(--brand)' }}>Hacktoberfest</a>
              </p>
            </div>
          </div>
        )}

        {tab === 'ideas' && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Project ideas tailored for <strong>{role}</strong> — build and publish these to stand out. Click any to add to your Start Learning plan.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
              {ideas.map((idea, i) => {
                const selected = selectedProjects.has(idea.title)
                return (
                  <div key={i} className="card" style={{ cursor: 'pointer', border: selected ? '1.5px solid var(--brand)' : '1px solid var(--gray-200)', transition: 'all .15s', position: 'relative' }}
                    onClick={() => toggleSelect(idea.title)}>
                    {selected && <div style={{ position: 'absolute', top: '12px', right: '12px' }}><CheckCircle size={18} color="var(--brand)" fill="var(--brand-light)" /></div>}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '.625rem' }}>
                      <span style={{ fontSize: '20px' }}>{['💡', '🚀', '🌟'][i % 3]}</span>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gray-900)', lineHeight: '1.4' }}>{idea.title}</h3>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.5', marginBottom: '.75rem' }}>{idea.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '.5rem' }}>
                      <span className="badge badge-gray">{idea.tech}</span>
                      <span className={`badge ${DIFFICULTY_COLOR[idea.level]}`}>{idea.level}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>📌 Publish on: {idea.platform}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'myprojects' && (
          <div>
            {myProjects.filter(p => p.name).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                <p style={{ fontSize: '32px', marginBottom: '1rem' }}>📁</p>
                <p style={{ fontSize: '14px' }}>No projects added yet. Complete your profile setup to add projects.</p>
                <button onClick={() => navigate('/onboarding')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Add projects →</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myProjects.filter(p => p.name).map((p, i) => (
                  <div key={i} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '.75rem' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--gray-900)' }}>{p.name}</h3>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.role && <span className="badge badge-blue">{p.role}</span>}
                        {p.duration && <span className="badge badge-gray">{p.duration}</span>}
                      </div>
                    </div>
                    {p.description && <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: '.75rem' }}>{p.description}</p>}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {p.tech && <span className="badge badge-gray">🛠 {p.tech}</span>}
                      {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Github size={13} /> View project</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedProjects.size > 0 && (
          <div style={{ position: 'sticky', bottom: '90px', display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button onClick={goToStartLearning} className="btn btn-primary btn-lg" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', boxShadow: '0 4px 20px rgba(37,99,235,.4)' }}>
              🚀 Start Learning — {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
