import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, FileText, BookOpen, UserCheck, Lightbulb, Rocket, Mic, ArrowRight } from 'lucide-react'
import { CTC_MAP, getPersonaLine } from '../lib/persona'

const INTENT_OPTIONS = [
  { to:'/jobs',     icon:Briefcase,  label:'Find a job',          sub:'Live roles matched to your skills', color:'var(--brand)',   bg:'var(--brand-light)' },
  { to:'/resume',   icon:FileText,   label:'Build resume + LinkedIn', sub:'ATS resume + profile copy',    color:'#7c3aed',       bg:'#f5f3ff' },
  { to:'/courses',  icon:BookOpen,   label:'Learn and apply',     sub:'Courses + skills + jobs',           color:'var(--success)', bg:'var(--success-light)' },
  { to:'/interview',icon:Mic,        label:'Interview prep',      sub:'Mock Q&A · readiness score',        color:'#db2777',       bg:'#fdf2f8' },
  { to:'/projects', icon:Lightbulb,  label:'Build portfolio',     sub:'Open source + project ideas',       color:'var(--warning)', bg:'var(--warning-light)' },
  { to:'/start-learning',icon:Rocket,label:'My learning plan',    sub:'Full roadmap + total cost',         color:'var(--brand)',   bg:'var(--brand-light)' },
]

const RESUME_FACTS = [
  '75% of resumes are rejected by ATS before a human ever sees them.',
  'Recruiters spend an average of 7 seconds scanning a resume.',
  'Resumes with quantified achievements get 40% more callbacks.',
  'A strong LinkedIn headline increases profile views by 14×.',
  'AI-optimised resumes get 2× more interview calls on average.',
]

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const expSlab = profile?.experience_slab || '0-2'
  const sector = profile?.sector || 'private'
  const ctcData = CTC_MAP[expSlab]?.[sector] || CTC_MAP['0-2'].private
  const personaLine = getPersonaLine(expSlab)
  const isProfileComplete = profile?.city && profile?.aspiration
  const randomFact = RESUME_FACTS[Math.floor(Math.random() * RESUME_FACTS.length)]
  const lastCtc = parseFloat(profile?.last_ctc_lpa) || 0
  const showDeserving = expSlab !== '0-2' && lastCtc >= 10

  return (
    <div style={{padding:'2rem 0'}}>
      <div className="page-container">

        {/* Persona greeting */}
        <div style={{display:'flex',gap:'12px',alignItems:'flex-start',marginBottom:'1.5rem'}}>
          <div style={{width:'46px',height:'46px',borderRadius:'50%',background:'var(--brand-light)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',fontWeight:'700',color:'var(--brand)',flexShrink:0}}>
            {profile?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 style={{fontSize:'20px',fontWeight:'700'}}>Namaste, {profile?.name?.split(' ')[0] || 'there'} 👋</h1>
            <p style={{color:'var(--gray-500)',marginTop:'3px',fontSize:'14px',lineHeight:'1.5'}}>{personaLine}</p>
          </div>
        </div>

        {/* CTC motivation card */}
        {isProfileComplete && (
          <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderLeft:'4px solid var(--brand)',borderRadius:'0 var(--radius-lg) var(--radius-lg) 0',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'1rem',flexWrap:'wrap'}}>
            <div style={{flex:1}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'var(--brand)',marginBottom:'4px'}}>{ctcData.line}</p>
              <p style={{fontSize:'13px',color:'var(--gray-600)',lineHeight:'1.6'}}>{ctcData.sub}</p>
              {showDeserving && (
                <p style={{fontSize:'13px',color:'var(--success)',fontWeight:'500',marginTop:'6px'}}>
                  ✨ With ₹{lastCtc}L last CTC — your next role should absolutely be higher. You've earned it.
                </p>
              )}
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <p style={{fontSize:'22px',fontWeight:'700',color:'var(--success)'}}>{ctcData.range}</p>
              <p style={{fontSize:'12px',color:'var(--gray-400)',marginTop:'2px'}}>
                {expSlab==='0-2' ? 'expected first CTC' : showDeserving ? 'you deserve this CTC' : 'target CTC range'}
              </p>
            </div>
          </div>
        )}

        {!isProfileComplete && (
          <div style={{background:'var(--warning-light)',border:'1px solid #fde68a',borderRadius:'var(--radius-lg)',padding:'1rem 1.25rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',flexWrap:'wrap'}}>
            <div>
              <p style={{fontWeight:'600',fontSize:'14px',color:'var(--warning)'}}>Complete your profile</p>
              <p style={{fontSize:'13px',color:'var(--gray-600)',marginTop:'2px'}}>Add education and career goal to unlock personalised recommendations</p>
            </div>
            <Link to="/onboarding" className="btn btn-sm" style={{background:'var(--warning)',color:'#fff',borderColor:'var(--warning)',whiteSpace:'nowrap'}}>
              Complete profile <ArrowRight size={14}/>
            </Link>
          </div>
        )}

        {/* Resume fact */}
        <div style={{background:'var(--gray-50)',border:'1px dashed var(--gray-300)',borderRadius:'var(--radius-md)',padding:'.875rem 1.25rem',marginBottom:'1.5rem',display:'flex',gap:'10px',alignItems:'flex-start'}}>
          <span style={{fontSize:'18px',flexShrink:0}}>💡</span>
          <p style={{fontSize:'13px',color:'var(--gray-600)',lineHeight:'1.5'}}><strong>Did you know?</strong> {randomFact}</p>
        </div>

        {/* What do you want to do today */}
        <p style={{fontSize:'13px',fontWeight:'600',color:'var(--gray-500)',marginBottom:'1rem',textTransform:'uppercase',letterSpacing:'.06em'}}>What would you like to do today?</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
          {INTENT_OPTIONS.map(({to,icon:Icon,label,sub,color,bg})=>(
            <Link key={to} to={to} style={{textDecoration:'none'}}>
              <div className="card" style={{cursor:'pointer',transition:'transform .15s,box-shadow .15s',display:'flex',gap:'1rem',alignItems:'flex-start'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='var(--shadow-md)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{width:'40px',height:'40px',borderRadius:'var(--radius-md)',background:bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <Icon size={20} color={color}/>
                </div>
                <div>
                  <p style={{fontWeight:'600',fontSize:'14px',color:'var(--gray-900)'}}>{label}</p>
                  <p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'3px',lineHeight:'1.5'}}>{sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
