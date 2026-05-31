'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [business, setBusiness] = useState(null)
  const [stats, setStats] = useState({
    customers: 0, scansThisMonth: 0, rewardsTotal: 0,
    returnRate: 0, newThisMonth: 0, topCustomer: null,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: totalCustomers } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', biz.id)
      const { count: scansMonth } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('business_id', biz.id).gte('created_at', startOfMonth)
      const { count: rewardsTotal } = await supabase.from('rewards').select('*', { count: 'exact', head: true }).eq('business_id', biz.id)
      const { count: newMonth } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', biz.id).gte('created_at', startOfMonth)
      const { count: activeCount } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', biz.id).gte('last_visit', thirtyDaysAgo)
      const returnRate = totalCustomers > 0 ? Math.round((activeCount / totalCustomers) * 100) : 0
      const { data: topClients } = await supabase.from('customers').select('first_name, last_name, visits, loyalty_points').eq('business_id', biz.id).order('visits', { ascending: false }).limit(1)
      setStats({ customers: totalCustomers || 0, scansThisMonth: scansMonth || 0, rewardsTotal: rewardsTotal || 0, returnRate, newThisMonth: newMonth || 0, topCustomer: topClients?.[0] || null })
      setLoading(false)
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { border-color: rgba(139,92,246,0.3) !important; transform: translateY(-2px); }
        .action-card { transition: all 0.2s; cursor: pointer; }
        .action-card:hover { border-color: rgba(139,92,246,0.4) !important; background: rgba(139,92,246,0.06) !important; transform: translateY(-2px); }
        .scan-btn { transition: all 0.2s; }
        .scan-btn:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(139,92,246,0.4); }
        .scan-btn:active { transform: scale(0.97); }

        /* MOBILE */
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .secondary-grid { grid-template-columns: 1fr !important; }
          .actions-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .header-row { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
          .nav-inner { padding: 0 1rem !important; }
          .main-pad { padding: 1.5rem 1rem !important; }
          .scan-btn-wrap { width: 100% !important; }
          .scan-btn { width: 100% !important; justify-content: center !important; }
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: '60px', display: 'flex', alignItems: 'center', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-inner" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#fff', fontFamily: 'Space Grotesk, sans-serif' }}>L</div>
            <span style={{ fontWeight: '700', fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '12px', color: '#6B7280', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{business?.name}</span>
            <button onClick={handleLogout} style={{ fontSize: '12px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>↩</button>
          </div>
        </div>
      </nav>

      <div className="main-pad" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>

        <div className="header-row fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '700', letterSpacing: '-0.5px', fontFamily: 'Space Grotesk, sans-serif' }}>Bonjour 👋</h1>
            <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '3px' }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="scan-btn-wrap">
            <button className="scan-btn" onClick={() => router.push('/scanner')} style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '14px', padding: '11px 20px', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit' }}>
              📷 Scanner un client
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.75rem', animationDelay: '0.1s' }}>
          {[
            { label: 'Clients', value: stats.customers, icon: '👥', color: '#8B5CF6', sub: `+${stats.newThisMonth}` },
            { label: 'Scans', value: stats.scansThisMonth, icon: '⚡', color: '#06B6D4', sub: 'ce mois' },
            { label: 'Récompenses', value: stats.rewardsTotal, icon: '🎁', color: '#10B981', sub: 'total' },
            { label: 'Retour', value: `${stats.returnRate}%`, icon: '🔄', color: '#F59E0B', sub: '30 jours' },
          ].map((stat, i) => (
            <div key={stat.label} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{stat.label}</span>
                <span style={{ fontSize: '16px' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '700', color: stat.color, letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: '#4B5563', marginTop: '2px' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Meilleur client + mois */}
        <div className="secondary-grid fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem', animationDelay: '0.2s' }}>
          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem' }}>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '0.75rem' }}>⭐ Meilleur client</div>
            {stats.topCustomer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#A78BFA', flexShrink: 0 }}>
                  {stats.topCustomer.first_name?.[0]}{stats.topCustomer.last_name?.[0]}
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '13px' }}>{stats.topCustomer.first_name} {stats.topCustomer.last_name}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280' }}>{stats.topCustomer.visits} visites</p>
                </div>
              </div>
            ) : <p style={{ color: '#4B5563', fontSize: '12px' }}>Aucun client</p>}
          </div>

          <div className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem' }}>
            <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '0.75rem' }}>📅 Ce mois</div>
            {[
              { label: 'Nouveaux', value: stats.newThisMonth, color: '#8B5CF6' },
              { label: 'Scans', value: stats.scansThisMonth, color: '#06B6D4' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px' }}>
                    <div style={{ height: '100%', width: item.value > 0 ? '100%' : '0%', background: item.color, borderRadius: '100px' }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: item.color }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="actions-grid fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', animationDelay: '0.3s' }}>
          {[
            { label: 'Clients', desc: 'Gérer', icon: '👥', href: '/customers', color: '#8B5CF6' },
            { label: 'Carte', desc: 'Personnaliser', icon: '🎴', href: '/cards', color: '#06B6D4' },
            { label: 'Scanner', desc: 'Points', icon: '📷', href: '/scanner', color: '#10B981' },
            { label: 'Profil', desc: 'Paramètres', icon: '⚙️', href: '/profile', color: '#F59E0B' },
          ].map(item => (
            <div key={item.label} className="action-card" onClick={() => router.push(item.href)}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: `${item.color}18`, border: `1px solid ${item.color}33`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 0.6rem' }}>{item.icon}</div>
              <p style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{item.label}</p>
              <p style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}