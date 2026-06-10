import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Briefcase, FileText, BookOpen, UserCheck, Lightbulb, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'

const MODULES = [
  { to: '/jobs', icon: Briefcase, label: 'Job opportunities', desc: 'Open roles in India matched to your profile', color: '#2563eb', bg: '#eff6ff' },
  { to: '/resume', icon: FileText, label: 'Resume builder', desc: 'AI-generated ATS-optimised resume', color: '#7c3aed', bg: '#f5f3ff' },
  { to: '/courses', icon: BookOpen, label: 'Courses', desc: 'Free & paid courses from YouTube, NPTEL, Coursera', color: '#16a34a', bg: '#f0fdf4' },
  { to: '/linkedin', icon: UserCheck, label: 'LinkedIn builder', desc: 'Headline, About, Skills — copy-ready', color: '#0a66c2', bg: '#e8f0fe' },
  { to: '/projects', icon: Lightbulb, label: 'Project ideas', desc: '3 portfolio projects with platforms to publish', color: '#d97706', bg: '#fffbeb' },
  { to: '/customize', icon: Sparkles, label: 'Customize', desc: 'Enter any prompt, get personalised career advice', color: '#db2777', bg: '#fdf2f8' },
]

export default function Dashboard() {
  const { profile } = useAuth()

  const isProfileComplete = profile?.city && profile?.education && profile?.aspiration

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700' }}>
            Namaste, {profile?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '.25rem', fontSize: '14px' }}>
            {isProfileComplete
              ? `${profile.aspiration} · ${profile.city} · ${profile.education?.toUpperCase()}`
              : 'Complete your profile to get personalised recommendations'}
          </p>
        </div>

        {!isProfileComplete && (
          <div style={{ background: 'var(--warning-light)', border: '1px solid #fde68a', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--warning)' }}>Profile incomplete</p>
              <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '2px' }}>Add your education and career goal to unlock all features</p>
            </div>
            <Link to="/onboarding" className="btn btn-sm" style={{ background: 'var(--warning)', color: '#fff', borderColor: 'var(--warning)', whiteSpace: 'nowrap' }}>
              Complete profile <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {isProfileComplete && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
            {[
              { label: 'Prompts left', value: (profile.free_prompts_limit || 5) - (profile.free_prompts_used || 0), color: 'var(--brand)' },
              { label: 'Budget', value: profile.budget_inr === 0 ? 'Free' : `₹${Number(profile.budget_inr).toLocaleString('en-IN')}`, color: 'var(--success)' },
              { label: 'Experience', value: profile.experience || 'Fresher', color: 'var(--warning)' },
              { label: 'Job type', value: profile.job_type || 'Any', color: '#7c3aed' },
            ].map(m => (
              <div key={m.label} style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <p style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.05em' }}>{m.label}</p>
                <p style={{ fontSize: '20px', fontWeight: '600', color: m.color, marginTop: '4px' }}>{m.value}</p>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '1rem', color: 'var(--gray-700)' }}>What would you like to do?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {MODULES.map(({ to, icon: Icon, label, desc, color, bg }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'transform .15s, box-shadow .15s', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--gray-900)' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '3px', lineHeight: '1.5' }}>{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
