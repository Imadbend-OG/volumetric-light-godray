import { useState } from 'react'

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('signup')

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '360px',
          borderRadius: '20px',
          background: 'rgba(30,30,40,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '28px 24px 24px',
          position: 'relative',
          color: 'white',
        }}>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: 'white', fontSize: '16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex', gap: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '30px', padding: '4px', marginBottom: '24px',
        }}>
          <button onClick={() => setTab('signup')} style={{
            padding: '8px 20px', borderRadius: '24px', border: 'none',
            background: tab === 'signup' ? 'white' : 'transparent',
            color: tab === 'signup' ? '#1a1a1a' : 'rgba(255,255,255,0.7)',
            fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>Sign up</button>
          <button onClick={() => setTab('signin')} style={{
            padding: '8px 20px', borderRadius: '24px', border: 'none',
            background: tab === 'signin' ? 'white' : 'transparent',
            color: tab === 'signin' ? '#1a1a1a' : 'rgba(255,255,255,0.7)',
            fontWeight: 600, fontSize: '14px', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>Sign in</button>
        </div>

        {/* Titre */}
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '20px' }}>
          {tab === 'signup' ? 'Créer un compte' : 'Se connecter'}
        </h2>

        {/* Formulaire signup */}
        {tab === 'signup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input placeholder="Prénom" style={inputStyle} />
              <input placeholder="Nom" style={inputStyle} />
            </div>
            <input placeholder="Email" type="email" style={inputStyle} />
            <input placeholder="Téléphone" type="tel" style={inputStyle} />
            <button style={btnPrimary}>Créer un compte</button>
          </div>
        )}

        {/* Formulaire signin */}
        {tab === 'signin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Email" type="email" style={inputStyle} />
            <input placeholder="Mot de passe" type="password" style={inputStyle} />
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                Mot de passe oublié ?
              </span>
            </div>
            <button style={btnPrimary}>Se connecter</button>
          </div>
        )}

        {/* Divider */}
        <div style={{
          textAlign: 'center', fontSize: '12px',
          color: 'rgba(255,255,255,0.4)', margin: '16px 0',
          letterSpacing: '0.05em',
        }}>OU SE CONNECTER AVEC</div>

        {/* OAuth */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button style={btnOauth}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button style={btnOauth}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        {tab === 'signup' && (
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: '16px' }}>
            En créant un compte, vous acceptez nos <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Conditions d'utilisation</span>
          </p>
        )}
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white', fontSize: '14px', outline: 'none',
  fontFamily: 'inherit',
}

const btnPrimary = {
  width: '100%', padding: '13px',
  borderRadius: '10px', border: 'none',
  background: 'white', color: '#1a1a1a',
  fontSize: '15px', fontWeight: 600,
  cursor: 'pointer',
}

const btnOauth = {
  padding: '11px', borderRadius: '10px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white', fontSize: '14px', fontWeight: 500,
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px',
}