'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) router.push('/dashboard')
      else setChecking(false)
    }
    check()
  }, [])

  if (checking) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.8s ease forwards; opacity: 0; }
        @keyframes float { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-12px) rotate(1deg); } }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes shine { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        .shine { background: linear-gradient(90deg, #fff 0%, #8B5CF6 25%, #06B6D4 50%, #EC4899 75%, #fff 100%); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shine 5s linear infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.95);} }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        @keyframes glow { 0%,100%{box-shadow:0 0 30px rgba(139,92,246,0.3);} 50%{box-shadow:0 0 60px rgba(139,92,246,0.6), 0 0 100px rgba(139,92,246,0.2);} }
        .glow { animation: glow 3s ease-in-out infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from{opacity:0;transform:translateX(-20px);} to{opacity:1;transform:none;} }
        .slide-in { animation: slideIn 0.5s ease forwards; }
        @keyframes orbit1 { from{transform:rotate(0deg) translateX(180px) rotate(0deg);} to{transform:rotate(360deg) translateX(180px) rotate(-360deg);} }
        @keyframes orbit2 { from{transform:rotate(180deg) translateX(130px) rotate(-180deg);} to{transform:rotate(540deg) translateX(130px) rotate(-540deg);} }
        .orbit1 { animation: orbit1 10s linear infinite; position:absolute; }
        .orbit2 { animation: orbit2 7s linear infinite; position:absolute; }
        .btn-cta { background:linear-gradient(135deg,#8B5CF6,#6D28D9); border:none; border-radius:16px; padding:16px 36px; color:#fff; font-size:16px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.3s; position:relative; overflow:hidden; letter-spacing:0.02em; }
        .btn-cta::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); transition:left 0.6s; }
        .btn-cta:hover::before { left:100%; }
        .btn-cta:hover { transform:translateY(-3px); box-shadow:0 16px 48px rgba(139,92,246,0.5); }
        .btn-outline { background:transparent; border:1px solid rgba(255,255,255,0.15); border-radius:16px; padding:16px 36px; color:#F0F0F5; font-size:16px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.3s; }
        .btn-outline:hover { background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.3); transform:translateY(-3px); }
        .feature-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:24px; padding:2rem; transition:all 0.4s; cursor:default; }
        .feature-card:hover { border-color:rgba(139,92,246,0.5); transform:translateY(-6px); background:rgba(139,92,246,0.06); box-shadow:0 20px 60px rgba(139,92,246,0.15); }
        .stat-item { text-align:center; }
        .wallet-card { border-radius:24px; padding:1.75rem; position:relative; overflow:hidden; transition:transform 0.3s; }
        .wallet-card:hover { transform:translateY(-4px) rotate(1deg); }
        .nav-link { color:#9CA3AF; font-size:14px; text-decoration:none; transition:color 0.2s; cursor:pointer; background:none; border:none; font-family:inherit; }
        .nav-link:hover { color:#F0F0F5; }
      `}</style>

      {/* Fond animé */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-25%', left: '-15%', width: '900px', height: '900px', background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '35%', right: '25%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 3rem', height: '68px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>L</div>
          <span style={{ fontWeight: '700', fontSize: '17px', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.3px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button className="nav-link">Fonctionnalités</button>
          <button className="nav-link">Tarifs</button>
          <button className="nav-link" onClick={() => router.push('/auth/login')}>Connexion</button>
          <button className="btn-cta" style={{ padding: '10px 24px', fontSize: '14px', borderRadius: '12px' }} onClick={() => router.push('/auth/register')}>
            Commencer gratuitement →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '7rem 2rem 5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div>
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '100px', padding: '6px 16px', marginBottom: '1.75rem' }}>
            <div className="pulse" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: '12px', color: '#A78BFA', fontWeight: '500' }}>La fidélité digitale nouvelle génération</span>
          </div>

          <h1 className="fade-up" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: '800', lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: '1.5rem', fontFamily: 'Space Grotesk, sans-serif', animationDelay: '0.1s' }}>
            Fidélisez vos clients{' '}
            <span className="shine">automatiquement</span>
          </h1>

          <p className="fade-up" style={{ fontSize: '17px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '2.5rem', fontWeight: '300', animationDelay: '0.2s' }}>
            Remplacez les cartes papier par une expérience digitale premium. QR codes, points automatiques, récompenses — vos clients reviennent, vous ne faites rien.
          </p>

          <div className="fade-up" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', animationDelay: '0.3s' }}>
            <button className="btn-cta" onClick={() => router.push('/auth/register')}>
              Créer ma carte gratuite ✦
            </button>
            <button className="btn-outline" onClick={() => router.push('/auth/login')}>
              Se connecter
            </button>
          </div>

          <div className="fade-up" style={{ display: 'flex', gap: '2rem', animationDelay: '0.4s' }}>
            {[
              { value: '2 400+', label: 'Commerces actifs' },
              { value: '380k', label: 'Cartes créées' },
              { value: '+34%', label: 'Taux de retour' },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#8B5CF6', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.5px' }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Carte animée */}
        <div className="fade-up" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '380px', animationDelay: '0.2s' }}>
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(139,92,246,0.1)' }} />
          <div style={{ position: 'absolute', width: '240px', height: '240px', borderRadius: '50%', border: '1px solid rgba(6,182,212,0.1)' }} />

          <div className="orbit1">
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>📱</div>
          </div>
          <div className="orbit2">
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #10B981, #059669)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' }}>⚡</div>
          </div>

          <div className="float glow" style={{ width: '300px', zIndex: 2 }}>
            <div className="wallet-card" style={{ background: 'linear-gradient(135deg, #8B5CF6, #4C1D95)', boxShadow: '0 24px 80px rgba(139,92,246,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Loyal<span style={{ color: '#A78BFA' }}>Pass</span></div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>Le Bistrot du Coin</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#fff', fontWeight: '600' }}>WALLET</div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points fidélité</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#fff', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1 }}>7 <span style={{ fontSize: '16px', opacity: 0.5, fontWeight: '400' }}>/ 10</span></div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} style={{ width: '22px', height: '22px', borderRadius: '50%', background: i < 7 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)', border: i < 7 ? 'none' : '1.5px solid rgba(255,255,255,0.2)', transition: 'all 0.3s' }} />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>🎁 1 café offert</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>Sophie M.</div>
              </div>
            </div>

            {/* Badges wallet */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '1rem' }}>
              {['🍎 Apple Wallet', '🤖 Google Wallet'].map(b => (
                <div key={b} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '6px 14px', fontSize: '12px', color: '#9CA3AF' }}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bande stats */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem 3rem', display: 'flex', justifyContent: 'center', gap: '4rem', background: 'rgba(255,255,255,0.02)', position: 'relative', zIndex: 1 }}>
        {[
          { icon: '⚡', text: 'Ajout de points en 2 secondes' },
          { icon: '📱', text: 'Apple & Google Wallet natif' },
          { icon: '🎯', text: 'Récompenses automatiques' },
          { icon: '📊', text: 'Analytics en temps réel' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '13px' }}>
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '6rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '11px', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600', marginBottom: '1rem' }}>Fonctionnalités</div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1rem' }}>
            Tout ce qu'il faut,{' '}
            <span className="shine">rien de superflu</span>
          </h2>
          <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7, fontWeight: '300' }}>
            Conçu pour les commerçants qui veulent des résultats sans la complexité.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {[
            { icon: '📷', title: 'Scanner QR instantané', desc: 'Scannez en 2 secondes depuis votre téléphone. Les points s\'ajoutent automatiquement, aucune saisie manuelle.', color: '#8B5CF6', delay: '0s' },
            { icon: '💳', title: 'Apple & Google Wallet', desc: 'Vos clients ajoutent leur carte en un clic. La carte se met à jour en temps réel avec leurs points.', color: '#06B6D4', delay: '0.1s' },
            { icon: '🎁', title: 'Récompenses automatiques', desc: 'Quand un client atteint son objectif, la récompense se déclenche automatiquement. Fini les oublis.', color: '#10B981', delay: '0.2s' },
            { icon: '🤖', title: 'Relances automatiques', desc: 'Un client inactif depuis 30 jours ? Il reçoit automatiquement une offre pour le faire revenir.', color: '#F59E0B', delay: '0.3s' },
            { icon: '📊', title: 'Analytics précis', desc: 'Taux de retour, meilleurs clients, scans par mois — toutes vos données en un coup d\'œil.', color: '#EC4899', delay: '0.4s' },
            { icon: '⚡', title: 'Setup en 5 minutes', desc: 'Créez votre carte, définissez vos récompenses, publiez. Vos clients peuvent s\'inscrire immédiatement.', color: '#A78BFA', delay: '0.5s' },
          ].map(f => (
            <div key={f.title} className="feature-card fade-up" style={{ animationDelay: f.delay }}>
              <div style={{ width: '48px', height: '48px', background: `${f.color}18`, border: `1px solid ${f.color}33`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '1.25rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '0.75rem', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.3px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7, fontWeight: '300' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '6rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '11px', color: '#06B6D4', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600', marginBottom: '1rem' }}>Comment ça marche</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'Space Grotesk, sans-serif' }}>
              Prêt en <span style={{ color: '#06B6D4' }}>5 minutes</span> chrono
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { num: '01', title: 'Créez votre carte', desc: 'Choisissez votre récompense et personnalisez les couleurs.', icon: '🎨' },
              { num: '02', title: 'Ajoutez vos clients', desc: 'Enregistrez-les et générez leur QR code unique.', icon: '👥' },
              { num: '03', title: 'Scannez à chaque visite', desc: 'Un scan rapide et les points s\'ajoutent instantanément.', icon: '📷' },
              { num: '04', title: 'Ils reviennent !', desc: 'Récompenses, notifications — le cycle vertueux démarre.', icon: '🔄' },
            ].map((step, i) => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', position: 'relative' }}>
                <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '700', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>{step.num}</div>
                <div style={{ fontSize: '28px', marginBottom: '0.75rem' }}>{step.icon}</div>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', fontFamily: 'Space Grotesk, sans-serif' }}>{step.title}</h3>
                <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>{step.desc}</p>
                {i < 3 && <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)', color: '#4B5563', fontSize: '18px', zIndex: 2 }}>›</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '6rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '11px', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '600', marginBottom: '1rem' }}>Tarifs</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'Space Grotesk, sans-serif' }}>
            Simple et <span style={{ color: '#10B981' }}>transparent</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            {
              name: 'Starter', price: '29,90€', period: '/mois', popular: false, color: '#8B5CF6',
              features: ['1 carte fidélité', '500 clients', 'Scanner QR', 'Apple & Google Wallet', 'Notifications push', 'Automatisations de base'],
            },
            {
              name: 'Business', price: '79,90€', period: '/mois', popular: true, color: '#06B6D4',
              features: ['Cartes illimitées', 'Clients illimités', 'Scanner QR', 'Apple & Google Wallet', 'Automatisations complètes', 'Analytics avancés', 'Multi-employés', 'IA & campagnes auto'],
            },
          ].map(plan => (
            <div key={plan.name} style={{ background: plan.popular ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${plan.popular ? 'rgba(6,182,212,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '24px', padding: '2rem', position: 'relative' }}>
              {plan.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #06B6D4, #0891B2)', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 16px', borderRadius: '100px', whiteSpace: 'nowrap' }}>⭐ Le plus populaire</div>}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: plan.color, marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{plan.period}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.75rem' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#9CA3AF' }}>
                    <span style={{ color: plan.color, fontSize: '12px' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button className="btn-cta" onClick={() => router.push('/auth/register')} style={{ width: '100%', background: plan.popular ? 'linear-gradient(135deg, #06B6D4, #0891B2)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)', padding: '13px', fontSize: '14px', borderRadius: '12px' }}>
                Commencer →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{ padding: '5rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '32px', padding: '4rem 3rem' }}>
          <div style={{ fontSize: '40px', marginBottom: '1.5rem' }}>🚀</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: '800', letterSpacing: '-0.04em', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '1rem' }}>
            Prêt à fidéliser <span className="shine">automatiquement</span> ?
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px', lineHeight: 1.7, marginBottom: '2rem', fontWeight: '300' }}>
            Rejoignez 2 400 commerçants qui ont modernisé leur fidélité. Configuration en 5 minutes, résultats immédiats.
          </p>
          <button className="btn-cta" onClick={() => router.push('/auth/register')} style={{ fontSize: '16px', padding: '16px 40px' }}>
            Créer mon compte gratuitement ✦
          </button>
          <p style={{ color: '#4B5563', fontSize: '12px', marginTop: '1rem' }}>Sans engagement · Annulez à tout moment</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>L</div>
          <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'Space Grotesk, sans-serif' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
        </div>
        <p style={{ color: '#4B5563', fontSize: '12px' }}>© 2026 LoyalPass · Tous droits réservés</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Confidentialité', 'CGV', 'Contact'].map(l => (
            <span key={l} style={{ color: '#4B5563', fontSize: '12px', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  )
}