import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mic, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

const QUESTIONS_DB = {
  'Data Analyst': {
    fresher: [
      { q:'Tell me about yourself and why Data Analytics.', tip:'Background → spark of interest → 1-2 skills → what you want to build. Keep it under 90 seconds.' },
      { q:'What is the difference between a left join and inner join?', tip:'Inner: only matching rows. Left: all rows from left table + matches from right. Give a real-world example.' },
      { q:'How would you clean a dataset with missing values?', tip:'Options: drop rows, mean/median imputation, forward fill, model-based. Explain tradeoffs.' },
      { q:'What tools have you used for data analysis?', tip:'Mention Excel, SQL, Python/Pandas, any BI tool. Even projects count.' },
    ],
    mid: [
      { q:'Walk me through a data project you led end-to-end.', tip:'Use STAR format. Focus on business impact, not just technical steps.' },
      { q:'How do you handle stakeholders who disagree with your analysis?', tip:'Show data, explain assumptions, be open to their context, find middle ground.' },
      { q:'Explain overfitting and how you prevent it.', tip:'Too much training data memorisation. Fix: cross-validation, regularisation, simpler model, more data.' },
    ],
    senior: [
      { q:'Describe how you built a data strategy for your organisation.', tip:'Talk about data governance, KPIs definition, tooling decisions, team building.' },
      { q:'How do you influence C-suite decisions using data?', tip:'Translate metrics to business outcomes. Use storytelling, not just charts.' },
      { q:'What does a mature analytics culture look like?', tip:'Self-serve tools, data literacy across teams, trusted data, experimentation mindset.' },
    ],
  },
  'Software Developer': {
    fresher: [
      { q:'Explain the difference between a stack and a queue.', tip:'Stack: LIFO. Queue: FIFO. Give real examples: call stack vs printer queue.' },
      { q:'What is OOP and what are its pillars?', tip:'Encapsulation, Inheritance, Polymorphism, Abstraction. One-line example each.' },
      { q:'How do you approach debugging a code issue?', tip:'Reproduce → isolate → check logs → rubber duck → binary search in code.' },
    ],
    mid: [
      { q:'How do you design a REST API?', tip:'Resources as nouns, HTTP verbs, status codes, versioning, auth, rate limiting.' },
      { q:'Explain database indexing and when not to use it.', tip:'Speeds reads, slows writes. Avoid on small tables, frequently updated columns.' },
    ],
    senior: [
      { q:'How do you approach system design for 10M users?', tip:'Load balancer → horizontal scaling → caching → CDN → DB sharding → async queues.' },
      { q:'Describe your approach to tech debt management.', tip:'Quantify it, schedule it, boy scout rule, refactor when touching adjacent code.' },
    ],
  },
  'Product Manager': {
    fresher: [
      { q:'How do you prioritise a product backlog?', tip:'RICE score, MoSCoW, or impact vs effort matrix. Mention stakeholder alignment.' },
      { q:'How would you define success for a new feature?', tip:'Define the problem → metric before launch → baseline → target → measurement plan.' },
    ],
    mid: [
      { q:'Walk me through a product you took from 0 to launch.', tip:'Discovery → definition → build → launch → measure. Include one failure and learnings.' },
      { q:'How do you balance engineering capacity with product vision?', tip:'Roadmap transparency, tech debt allocation, quarterly planning, empathy for eng.' },
    ],
    senior: [
      { q:'How do you build and scale a product team?', tip:'Hiring bar, culture, autonomy with accountability, OKRs, career ladders.' },
      { q:'How have you influenced company strategy through product?', tip:'Data-backed proposals, exec communication, long-term bets vs short-term wins.' },
    ],
  },
  default: {
    fresher: [
      { q:'Tell me about yourself.', tip:'2 minutes: background → education → skills → why this role.' },
      { q:'Why do you want this role?', tip:'Be specific about the company + role. Research before the interview.' },
      { q:'What are your strengths?', tip:'Pick 2-3, give evidence. Don\'t just list adjectives.' },
    ],
    mid: [
      { q:'Describe a challenging project and how you handled it.', tip:'STAR: Situation, Task, Action, Result. Quantify the outcome.' },
      { q:'How do you manage competing priorities?', tip:'Prioritisation framework, communication with stakeholders, trade-off decisions.' },
    ],
    senior: [
      { q:'What is your leadership philosophy?', tip:'Servant leadership, empowerment, clear expectations, feedback culture.' },
      { q:'How have you grown a team or mentored others?', tip:'Specific examples of people you\'ve developed and their outcomes.' },
    ],
  }
}

const LEVEL_MAP = { '0-2':'fresher', '2-5':'mid', '5-8':'mid', '8-12':'senior', '12+':'senior' }

const READINESS_AREAS = [
  { key:'technical',   label:'Technical knowledge',     base:0.6 },
  { key:'communication',label:'Communication clarity',  base:0.45 },
  { key:'behavioural', label:'Behavioural / STAR',      base:0.35 },
  { key:'resume',      label:'Resume confidence',       base:0.7 },
  { key:'company',     label:'Company research',        base:0.3 },
]

export default function Interview() {
  const { profile } = useAuth()
  const [tab, setTab] = useState('questions')
  const [activeLevel, setActiveLevel] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [practiced, setPracticed] = useState(new Set())
  const [mockInput, setMockInput] = useState('')
  const [mockHistory, setMockHistory] = useState([])
  const [mockQIdx, setMockQIdx] = useState(0)

  const role = profile?.aspiration || 'default'
  const expSlab = profile?.experience_slab || '0-2'
  const defaultLevel = LEVEL_MAP[expSlab] || 'fresher'
  const level = activeLevel || defaultLevel
  const roleQuestions = QUESTIONS_DB[role] || QUESTIONS_DB['default']
  const questions = roleQuestions[level] || roleQuestions['fresher'] || []
  const mockQuestions = [...(roleQuestions.fresher||[]), ...(roleQuestions.mid||[])].slice(0,6)

  function markPracticed(q) { setPracticed(prev=>new Set([...prev,q])) }

  function submitMock() {
    if (!mockInput.trim()) return
    const nextIdx = mockQIdx + 1
    setMockHistory(h=>[...h, { role:'user', content:mockInput }, {
      role:'ai', content: nextIdx < mockQuestions.length
        ? `Good answer! Next question: "${mockQuestions[nextIdx].q}"`
        : `Well done! You've completed all ${mockQuestions.length} questions. Check your readiness score in the Readiness tab.`
    }])
    setMockInput('')
    if (nextIdx < mockQuestions.length) setMockQIdx(nextIdx)
    markPracticed(mockQuestions[mockQIdx]?.q)
  }

  const readinessScore = Math.round(
    READINESS_AREAS.reduce((s,a) => s + a.base, 0) / READINESS_AREAS.length * 100 +
    practiced.size * 5
  )
  const clampedScore = Math.min(95, readinessScore)

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="page-container" style={{maxWidth:'760px'}}>
        <h1 className="section-title" style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
          <Mic size={20} color="#db2777"/> Interview prep
        </h1>
        <p className="text-muted" style={{marginBottom:'1.5rem'}}>
          Role: <strong>{role}</strong> · Level: <strong>{expSlab} yrs</strong> · {practiced.size} questions practiced
        </p>

        <div className="tab-bar">
          {[['questions','Sample questions'],['mock','Mock interview'],['readiness','Readiness score']].map(([id,label])=>(
            <button key={id} className={`tab-item ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{label}</button>
          ))}
        </div>

        {/* SAMPLE QUESTIONS */}
        {tab==='questions' && (
          <div>
            <div style={{display:'flex',gap:'8px',marginBottom:'1.25rem',flexWrap:'wrap'}}>
              {['fresher','mid','senior'].map(l=>(
                <span key={l} className={`chip ${level===l?'active':''}`} onClick={()=>setActiveLevel(activeLevel===l?null:l)}>
                  {l==='fresher'?'Fresher / 0–2 yrs':l==='mid'?'Mid / 2–8 yrs':'Senior / 8+ yrs'}
                </span>
              ))}
            </div>

            {questions.length===0 ? (
              <div className="card" style={{textAlign:'center',padding:'2rem',color:'var(--gray-400)'}}>No questions for this level yet.</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                {questions.map((item,i)=>(
                  <div key={i} className="card" style={{border:practiced.has(item.q)?'1.5px solid var(--success)':'1px solid var(--gray-200)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px',marginBottom:'6px'}}>
                      <p style={{fontSize:'14px',fontWeight:'600',color:'var(--gray-900)',flex:1,lineHeight:'1.4'}}>{item.q}</p>
                      <div style={{display:'flex',gap:'6px',flexShrink:0,alignItems:'center'}}>
                        {practiced.has(item.q) && <CheckCircle size={16} color="var(--success)"/>}
                        <span className={`badge ${level==='fresher'?'badge-green':level==='mid'?'badge-yellow':'badge-red'}`}>
                          {level==='fresher'?'Fresher':level==='mid'?'Mid-level':'Senior'}
                        </span>
                      </div>
                    </div>
                    <button onClick={()=>setExpanded(expanded===i?null:i)} className="btn btn-ghost btn-sm" style={{marginBottom:'6px'}}>
                      {expanded===i?<><ChevronUp size={13}/> Hide tip</>:<><ChevronDown size={13}/> Show answer tip</>}
                    </button>
                    {expanded===i && (
                      <div style={{background:'var(--brand-light)',borderRadius:'var(--radius-md)',padding:'.75rem',marginBottom:'8px',fontSize:'13px',color:'var(--brand)',lineHeight:'1.6'}}>
                        💡 <strong>Tip:</strong> {item.tip}
                      </div>
                    )}
                    <button onClick={()=>markPracticed(item.q)} className={`btn btn-sm ${practiced.has(item.q)?'btn-outline':'btn-primary'}`}>
                      {practiced.has(item.q)?'✓ Practiced':'Mark as practiced'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MOCK INTERVIEW */}
        {tab==='mock' && (
          <div>
            <div className="card" style={{background:'var(--brand-light)',border:'1px solid var(--brand)',marginBottom:'1rem'}}>
              <p style={{fontSize:'13px',fontWeight:'600',color:'var(--brand)',marginBottom:'4px'}}>AI mock interview — {role}, {level} level</p>
              <p style={{fontSize:'12px',color:'var(--brand)'}}>Type your answer and press Enter. The AI will respond with the next question. {mockQuestions.length} questions total.</p>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginBottom:'1rem',minHeight:'200px'}}>
              <div style={{background:'var(--gray-100)',borderRadius:'var(--radius-md)',padding:'10px 12px',fontSize:'13px',maxWidth:'85%'}}>
                <p style={{fontWeight:'600',color:'var(--brand)',marginBottom:'4px',fontSize:'12px'}}>Interviewer</p>
                <p>{mockQuestions[0]?.q || 'Tell me about yourself.'}</p>
              </div>
              {mockHistory.map((m,i)=>(
                <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                  <div style={{background:m.role==='user'?'var(--brand)':'var(--gray-100)',borderRadius:m.role==='user'?'14px 14px 4px 14px':'4px 14px 14px 14px',padding:'10px 12px',fontSize:'13px',maxWidth:'85%',color:m.role==='user'?'#fff':'var(--gray-900)'}}>
                    {m.role==='ai' && <p style={{fontWeight:'600',color:'var(--brand)',marginBottom:'4px',fontSize:'12px'}}>Interviewer</p>}
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:'8px'}}>
              <textarea value={mockInput} onChange={e=>setMockInput(e.target.value)} rows={3}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitMock()}}}
                placeholder="Type your answer… (Enter to submit)"
                style={{flex:1,resize:'none',fontSize:'13px',padding:'8px'}}/>
              <button onClick={submitMock} className="btn btn-primary" style={{alignSelf:'flex-end'}}>Submit →</button>
            </div>
          </div>
        )}

        {/* READINESS SCORE */}
        {tab==='readiness' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'1.5rem'}}>
              <div style={{background:'var(--gray-50)',borderRadius:'var(--radius-md)',padding:'1.25rem',textAlign:'center'}}>
                <p style={{fontSize:'36px',fontWeight:'700',color:clampedScore>=70?'var(--success)':clampedScore>=50?'var(--warning)':'var(--danger)'}}>{clampedScore}%</p>
                <p style={{fontSize:'13px',color:'var(--gray-500)',marginTop:'4px'}}>Overall readiness</p>
                <p style={{fontSize:'12px',color:'var(--gray-400)',marginTop:'4px'}}>{clampedScore>=75?'Interview ready!':clampedScore>=55?'Almost there':'Keep practising'}</p>
              </div>
              <div style={{background:'var(--gray-50)',borderRadius:'var(--radius-md)',padding:'1.25rem',textAlign:'center'}}>
                <p style={{fontSize:'36px',fontWeight:'700',color:'var(--brand)'}}>{practiced.size}/{questions.length}</p>
                <p style={{fontSize:'13px',color:'var(--gray-500)',marginTop:'4px'}}>Questions practiced</p>
                <p style={{fontSize:'12px',color:'var(--gray-400)',marginTop:'4px'}}>Each +5% to score</p>
              </div>
            </div>

            <div className="card">
              <p style={{fontSize:'14px',fontWeight:'600',marginBottom:'1rem'}}>Readiness breakdown</p>
              {READINESS_AREAS.map((area,i)=>{
                const score = Math.round(Math.min(100,(area.base + practiced.size*0.03)*100))
                const color = score>=70?'var(--success)':score>=50?'var(--warning)':'var(--danger)'
                return (
                  <div key={i} style={{marginBottom:'1rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                      <span style={{fontSize:'13px',color:'var(--gray-700)'}}>{area.label}</span>
                      <span style={{fontSize:'13px',fontWeight:'600',color}}>{score}%</span>
                    </div>
                    <div style={{height:'6px',background:'var(--gray-200)',borderRadius:'3px'}}>
                      <div style={{width:`${score}%`,height:'100%',background:color,borderRadius:'3px',transition:'width .4s'}}/>
                    </div>
                  </div>
                )
              })}
              {clampedScore < 75 && (
                <div style={{padding:'10px 12px',background:'var(--warning-light)',borderRadius:'var(--radius-md)',marginTop:'.5rem'}}>
                  <p style={{fontSize:'13px',fontWeight:'600',color:'var(--warning)',marginBottom:'3px'}}>Focus area</p>
                  <p style={{fontSize:'12px',color:'var(--warning)',lineHeight:'1.5'}}>
                    {practiced.size < 3 ? 'Practice at least 3 more questions in the Sample tab to boost your score.' : 'Work on behavioural (STAR-format) answers — they make the biggest difference in final rounds.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
