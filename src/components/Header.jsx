import { useState, useEffect } from 'react'
import state from '../state'

export default function Header({ onAccountClick }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let animFrame
    const loop = () => {
      // Devient noir quand on dépasse 80% de la première scène
      const threshold = window.innerHeight * 0.8
      const shouldBeDark = state.top > threshold
      setDark(prev => prev !== shouldBeDark ? shouldBeDark : prev)
      animFrame = requestAnimationFrame(loop)
    }
    animFrame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animFrame)
  }, [])

  const color = dark ? '#1a1a1a' : 'white'
  const borderColor = dark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'
  const borderHover = dark ? '#1a1a1a' : 'white'

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 1000,
      background: 'transparent',
      transition: 'all 0.3s ease',
    }}>
      {/* Logo cliquable */}
      <a
        href="/"
        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        style={{ textDecoration: 'none', cursor: 'pointer' }}>
        <img
          src={dark ? '/images/noir.png' : '/images/blanc.png'}
          alt="énergie"
          style={{ height: '40px', objectFit: 'contain', transition: 'opacity 0.3s ease' }}
        />
      </a>

      <button
        onClick={onAccountClick}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: 'transparent',
          border: `1.5px solid ${borderColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.3s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = borderHover}
        onMouseLeave={e => e.currentTarget.style.borderColor = borderColor}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 0.3s ease' }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </div>
  )
}