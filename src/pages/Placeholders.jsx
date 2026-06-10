// Placeholder pages — will be built out in next iteration

import { Briefcase } from 'lucide-react'

function Placeholder({ title, icon: Icon, color, desc }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="page-container" style={{ maxWidth: '720px' }}>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Icon size={28} color={color} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '.5rem' }}>{title}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>{desc}</p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>🚧 Coming in next build — use <strong>Customize</strong> for AI-powered results now</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { FileText, BookOpen, Lightbulb } from 'lucide-react'
import { UserCheck } from 'lucide-react'

export function Jobs() { return <Placeholder title="Job Opportunities" icon={Briefcase} color="#2563eb" desc="India job listings matched to your profile from Indeed, Naukri, and Internshala." /> }
export function Resume() { return <Placeholder title="Resume Builder" icon={FileText} color="#7c3aed" desc="AI-generated ATS-optimised resume with PDF download." /> }
export function Courses() { return <Placeholder title="Courses" icon={BookOpen} color="#16a34a" desc="Free and paid courses from YouTube, NPTEL, Coursera and Great Learning." /> }
export function LinkedInPage() { return <Placeholder title="LinkedIn Builder" icon={UserCheck} color="#0a66c2" desc="Headline, About section and Skills copy-ready for your LinkedIn profile." /> }
export function Projects() { return <Placeholder title="Project Ideas" icon={Lightbulb} color="#d97706" desc="3 portfolio project ideas with platforms to publish and showcase your work." /> }
