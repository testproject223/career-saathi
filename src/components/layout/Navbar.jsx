import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Briefcase, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to:'/dashboard', label:'Dashboard' },
    { to:'/jobs',      label:'Jobs' },
    { to:'/resume',    label:'Resume' },
    { to:'/courses',   label:'Courses' },
    { to:'/linkedin',  label:'LinkedIn' },
    { to:'/projects',  label:'Projects' },
    { to:'/interview', label:'Interview Prep' },
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="page-container navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <Briefcase size={20} />
          <span>Career Saathi</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map(l => (
            <Link key={l.to} to={l.to}
              className={`navbar-link ${location.pathname === l.to ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <Link to="/start-learning" className="btn btn-primary btn-sm" style={{ whiteSpace:'nowrap' }}>
            🚀 Start Learning
          </Link>
          <div className="navbar-avatar">{profile?.name?.[0]?.toUpperCase() || 'U'}</div>
          <span className="navbar-name">{profile?.name?.split(' ')[0] || 'User'}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleSignOut}><LogOut size={14} /></button>
        </div>
      </div>
    </nav>
  )
}
