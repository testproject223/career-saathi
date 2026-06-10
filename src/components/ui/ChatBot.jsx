import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { MessageCircle, X, Send, ChevronDown, Mail, Phone } from 'lucide-react'

const AUTHOR = {
  name: 'Harsh Sharma',
  email: 'sharmaharshu90@gmail.com',
  whatsapp: '+91 90000 00000', // update with real number
}

const QUICK_ACTIONS = [
  'Optimise my resume for my target role',
  'Update my LinkedIn headline',
  'Suggest courses for my profile',
  'What jobs match my skills?',
  'Review my project descriptions',
]

export default function ChatBot() {
  const { profile, user, updateProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const bottomRef = useRef()
  const inputRef = useRef()

  const used = profile?.chatbot_prompts_used || 0
  const limit = profile?.chatbot_prompts_limit || 5
  const remaining = limit - used

  useEffect(() => {
    if (open && messages.length === 0) loadHistory()
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadHistory() {
    if (!user) return
    const { data } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20)
    if (data && data.length > 0) {
      setMessages(data)
    } else {
      setMessages([{
        role: 'assistant',
        content: `Hi ${profile?.name?.split(' ')[0] || 'there'}! 👋 I'm your Career Saathi assistant.\n\nI can help you:\n• Optimise your resume\n• Improve your LinkedIn profile\n• Recommend courses\n• Update your career details\n\nYou have **${remaining} free prompts**. What would you like to do?`
      }])
    }
  }

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg) return

    if (remaining <= 0) {
      setShowContact(true)
      return
    }

    setInput('')
    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Save user message
    if (user) {
      await supabase.from('chat_messages').insert({ user_id: user.id, role: 'user', content: msg })
    }

    try {
      // Call Claude API via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('chatbot', {
        body: { message: msg, profile, history: messages.slice(-6) }
      })

      let reply = ''
      if (error || !data) {
        // Fallback: local smart responses
        reply = generateLocalReply(msg, profile)
      } else {
        reply = data.reply || data.content || generateLocalReply(msg, profile)
      }

      const assistantMsg = { role: 'assistant', content: reply }
      setMessages(prev => [...prev, assistantMsg])

      if (user) {
        await supabase.from('chat_messages').insert({ user_id: user.id, role: 'assistant', content: reply })
        await updateProfile({ chatbot_prompts_used: used + 1 })
      }
    } catch (e) {
      const reply = generateLocalReply(msg, profile)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (user) await updateProfile({ chatbot_prompts_used: used + 1 })
    }
    setLoading(false)
  }

  // Smart local fallback when edge function isn't set up yet
  function generateLocalReply(msg, profile) {
    const m = msg.toLowerCase()
    const name = profile?.name?.split(' ')[0] || 'there'
    const role = profile?.aspiration || 'your target role'
    const skills = (profile?.skills || []).join(', ')

    if (m.includes('resume') || m.includes('cv')) {
      return `For your **${role}** resume, here are key optimisations:\n\n1. **Add these ATS keywords**: ${getATSKeywords(role).join(', ')}\n2. **Quantify your achievements** — add numbers like "increased by 30%", "managed team of 5"\n3. **Lead with a strong objective** aligned to ${role}\n4. **List your top skills first**: ${skills || 'add your skills in your profile'}\n\nGo to the **Resume** tab to rebuild with these improvements. 📄`
    }
    if (m.includes('linkedin')) {
      return `To improve your LinkedIn for **${role}**:\n\n1. **Headline**: "${profile?.education?.toUpperCase() || 'Graduate'} | Aspiring ${role} | Open to Work"\n2. **Add the #OpenToWork** frame on your photo\n3. **Connect with 10+ recruiters** searching for ${role} in ${profile?.city || 'India'}\n4. **Post weekly** about what you're learning\n\nGo to the **LinkedIn** tab for your complete AI-generated profile copy. 🔗`
    }
    if (m.includes('course') || m.includes('learn') || m.includes('skill')) {
      return `Based on your goal to become a **${role}**, I recommend:\n\n1. **Start free**: SQL tutorial on YouTube (freeCodeCamp) + NPTEL Python\n2. **Best ROI paid**: Google ${role.includes('Data') ? 'Data Analytics' : 'Digital Marketing'} Certificate on Coursera (~₹3,200)\n3. **Quick win**: Great Learning free courses (${role})\n\nGo to the **Courses** tab to see all options filtered by your ₹${profile?.budget_inr?.toLocaleString('en-IN') || '0'} budget. 📚`
    }
    if (m.includes('job') || m.includes('opportunit')) {
      return `For **${role}** jobs in India:\n\n1. Top hiring companies: TCS, Infosys, Wipro, Accenture, Deloitte\n2. Best job portals: Naukri, LinkedIn, Indeed, Internshala (freshers)\n3. Apply to **10 jobs/week** minimum\n4. Customise your resume for each application\n\nGo to **Jobs** tab to see live opportunities matched to your profile. 💼`
    }
    if (m.includes('project')) {
      return `For **${role}** portfolio projects:\n\n1. **Beginner**: ${getProjectIdea(role, 0)}\n2. **Intermediate**: ${getProjectIdea(role, 1)}\n3. **Advanced**: ${getProjectIdea(role, 2)}\n\nPublish on GitHub and add the link to your resume and LinkedIn. Go to **Projects** tab for detailed guides. 💡`
    }
    if (m.includes('update') || m.includes('change') || m.includes('edit')) {
      return `To update your profile details:\n\n1. Go to **Dashboard** → click your profile info at top\n2. Or go to **Onboarding** to re-do the full setup\n3. Use the **Customize** tab for AI-powered changes\n\nWhat specifically would you like to update? I can guide you to the right section. ✏️`
    }
    return `I can help you with:\n\n• **Resume** — optimise for ${role}\n• **LinkedIn** — improve your profile\n• **Courses** — best for your budget\n• **Jobs** — find opportunities in India\n• **Projects** — build your portfolio\n\nTry one of the quick actions below, or type your question! 😊`
  }

  function getATSKeywords(role) {
    const kw = {
      'Data Analyst': ['data analysis', 'SQL', 'Python', 'Excel', 'visualization', 'Power BI', 'Tableau', 'business intelligence'],
      'Software Developer': ['software development', 'algorithms', 'git', 'agile', 'API', 'debugging', 'code review'],
      'Digital Marketer': ['SEO', 'SEM', 'analytics', 'campaigns', 'ROI', 'content strategy', 'social media'],
      'Business Analyst': ['requirements gathering', 'process improvement', 'stakeholder', 'SQL', 'documentation'],
    }
    return (kw[role] || ['communication', 'teamwork', 'problem solving', 'Microsoft Office']).slice(0, 4)
  }

  function getProjectIdea(role, idx) {
    const ideas = {
      'Data Analyst': ['Sales data dashboard in Excel/Power BI', 'Python script to analyse Twitter/news data', 'End-to-end EDA on Kaggle dataset with insights report'],
      'Software Developer': ['To-do app with React + Node.js', 'REST API with authentication using Express', 'Full-stack CRUD app deployed on Vercel/Railway'],
      'default': ['Personal portfolio website', 'Automated Excel report generator', 'Chat app using Firebase'],
    }
    return (ideas[role] || ideas['default'])[idx] || ideas['default'][idx]
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen(!open); setShowContact(false) }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
          width: '54px', height: '54px', borderRadius: '50%',
          background: 'var(--brand)', color: '#fff', border: 'none',
          cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform .2s, box-shadow .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {remaining > 0 && !open && (
          <span style={{ position: 'absolute', top: '0', right: '0', width: '18px', height: '18px', borderRadius: '50%', background: 'var(--success)', fontSize: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>
            {remaining}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 998,
          width: '360px', maxWidth: 'calc(100vw - 48px)',
          background: '#fff', borderRadius: '16px',
          boxShadow: '0 8px 40px rgba(0,0,0,.15)',
          display: 'flex', flexDirection: 'column',
          maxHeight: '520px', overflow: 'hidden',
          border: '1px solid var(--gray-200)',
        }}>
          {/* Header */}
          <div style={{ background: 'var(--brand)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>Career Saathi AI</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,.8)' }}>{remaining} free prompt{remaining !== 1 ? 's' : ''} remaining</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.8)', padding: '4px' }}><X size={18} /></button>
          </div>

          {/* Prompt counter dots */}
          <div style={{ display: 'flex', gap: '4px', padding: '8px 16px', background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', justifyContent: 'center' }}>
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: i < remaining ? 'var(--success)' : 'var(--gray-300)', transition: 'background .3s' }} />
            ))}
            <span style={{ fontSize: '11px', color: 'var(--gray-400)', marginLeft: '6px' }}>{remaining}/{limit} free</span>
          </div>

          {/* Messages */}
          {!showContact ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '85%', padding: '10px 13px',
                      borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                      background: m.role === 'user' ? 'var(--brand)' : 'var(--gray-100)',
                      color: m.role === 'user' ? '#fff' : 'var(--gray-800)',
                      fontSize: '13px', lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {m.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', gap: '4px', padding: '10px 13px', background: 'var(--gray-100)', borderRadius: '4px 14px 14px 14px', width: 'fit-content' }}>
                    {[0, 1, 2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gray-400)', animation: `bounce .8s ${i * .2}s infinite` }} />)}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick actions */}
              {messages.length <= 1 && (
                <div style={{ padding: '0 12px 8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {QUICK_ACTIONS.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'var(--brand-light)', color: 'var(--brand)', border: '1px solid var(--brand)', cursor: 'pointer', transition: 'all .15s' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: '10px 12px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: '8px' }}>
                {remaining <= 0 ? (
                  <button onClick={() => setShowContact(true)} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--warning)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
                    Free prompts used — contact for more
                  </button>
                ) : (
                  <>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ask anything about your career…"
                      style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--gray-200)', fontSize: '13px', outline: 'none' }}
                    />
                    <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: input.trim() ? 'var(--brand)' : 'var(--gray-200)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Send size={15} />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Contact screen */
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '32px', marginBottom: '.5rem' }}>🙏</p>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '.5rem' }}>You've used all 5 free prompts</h3>
                <p style={{ fontSize: '13px', color: 'var(--gray-500)', lineHeight: '1.6' }}>Reach out to {AUTHOR.name} to get more prompts or a personalised career consultation</p>
              </div>
              <a href={`mailto:${AUTHOR.email}?subject=Career Saathi - More Prompts Request&body=Hi Harsh,%0D%0A%0D%0AI've used my 5 free prompts on Career Saathi.%0D%0A%0D%0AMy name: ${profile?.name || ''}%0D%0ACareer goal: ${profile?.aspiration || ''}%0D%0ACity: ${profile?.city || ''}%0D%0A%0D%0AI'd like to continue using the chatbot and would love a personalised consultation.%0D%0A%0D%0AThank you!`}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'var(--brand-light)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--brand)', transition: 'background .15s' }}>
                <Mail size={20} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>Email {AUTHOR.name}</p>
                  <p style={{ fontSize: '12px', opacity: .8 }}>{AUTHOR.email}</p>
                </div>
              </a>
              <a href={`https://wa.me/${AUTHOR.whatsapp.replace(/\D/g, '')}?text=Hi Harsh, I've used my 5 free prompts on Career Saathi. My name is ${encodeURIComponent(profile?.name || '')} and I'm looking to become a ${encodeURIComponent(profile?.aspiration || '')}. Can I get more prompts?`}
                target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: '#f0fdf4', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'var(--success)' }}>
                <Phone size={20} />
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600' }}>WhatsApp</p>
                  <p style={{ fontSize: '12px', opacity: .8 }}>{AUTHOR.whatsapp}</p>
                </div>
              </a>
              <button onClick={() => setShowContact(false)} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>← Back to chat</button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0) }
          40% { transform: translateY(-6px) }
        }
      `}</style>
    </>
  )
}
