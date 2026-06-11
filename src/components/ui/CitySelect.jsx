import { useState, useRef, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { searchCities } from '../../lib/cities'

export default function CitySelect({ value, onChange, placeholder = 'City…' }) {
  const [query, setQuery] = useState(value || '')
  const [options, setOptions] = useState([])
  const [open, setOpen] = useState(false)
  const wrapRef = useRef()

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handleClick = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleInput(e) {
    const val = e.target.value
    setQuery(val)
    onChange(val)
    const results = searchCities(val)
    setOptions(results)
    setOpen(results.length > 0)
  }

  function selectCity(city) {
    setQuery(city)
    onChange(city)
    setOpen(false)
    setOptions([])
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1, minWidth: '130px' }}>
      <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => query.length >= 2 && setOpen(options.length > 0)}
        placeholder={placeholder}
        style={{ paddingLeft: '30px' }}
        autoComplete="off"
      />
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 100, marginTop: '2px', maxHeight: '220px', overflowY: 'auto' }}>
          {options.map(city => (
            <div key={city} onMouseDown={() => selectCity(city)}
              style={{ padding: '9px 12px', fontSize: '13px', cursor: 'pointer', color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <MapPin size={12} color="var(--gray-400)" />
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
