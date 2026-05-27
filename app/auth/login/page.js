'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false) }
    else router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', -apple-system, sans-serif", padding: '1rem', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input-field { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; color: #F0F0F5; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(139, 92, 246, 0.6); background: rgba(139, 92, 246, 0.04); }
        .input-field::placeholder { color: #4B5563; }
        .btn-submit { width: 100%; background: linear-gradient(135deg, #8B5CF6, #6D28D9); border: none; border-radius: 12px; padding: 13px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s, transform 0.2s; }
        .btn-submit:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .link { color: #8B5CF6; text-decoration: none; }
        .link:hover { text-decoration: underline; }
      `}</style>

      {/* Background ambiance */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '24px', fontWeight: '700', color: '#fff', boxShadow: '0 8px 32px rgba(139,92,246,0.3)' }}>L</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#F0F0F5', letterSpacing: '-0.5px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></h1>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '6px' }}>Connectez-vous à votre espace</p>
        </div>

        {/* Card */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem', backdropFilter: 'blur(12px)' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@commerce.fr" required className="input-field" />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="input-field" />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#F87171', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-submit" style={{ marginTop: '0.25rem' }}>
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6B7280', marginTop: '1.5rem' }}>
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="link">Créer un compte</Link>
        </p>
      </div>
    </div>
  )
}