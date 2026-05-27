'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [business, setBusiness] = useState(null)
  const [stats, setStats] = useState({
    customers: 0,
    scansThisMonth: 0,
    rewardsTotal: 0,
    returnRate: 0,
    newThisMonth: 0,
    topCustomer: null,
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: biz } = await supabase
        .from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Total clients
      const { count: totalCustomers } = await supabase
        .from('customers').select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)

      // Scans ce mois
      const { count: scansMonth } = await supabase
        .from('transactions').select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .gte('created_at', startOfMonth)

      // Récompenses total
      const { count: rewardsTotal } = await supabase
        .from('rewards').select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)

      // Nouveaux clients ce mois
      const { count: newMonth } = await supabase
        .from('customers').select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .gte('created_at', startOfMonth)

      // Clients actifs (visite dans les 30 derniers jours)
      const { count: activeCount } = await supabase
        .from('customers').select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)
        .gte('last_visit', thirtyDaysAgo)

      // Taux de retour
      const returnRate = totalCustomers > 0 ? Math.round((activeCount / totalCustomers) * 100) : 0

      // Meilleur client
      const { data: topClients } = await supabase
        .from('customers').select('first_name, last_name, visits, loyalty_points')
        .eq('business_id', biz.id)
        .order('visits', { ascending: false })
        .limit(1)

      setStats({
        customers: totalCustomers || 0,
        scansThisMonth: scansMonth || 0,
        rewardsTotal: rewardsTotal || 0,
        returnRate,
        newThisMonth: newMonth || 0,
        topCustomer: topClients?.[0] || null,
      })
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
      <div style={{ color: '#6B7280', fontSize: '14px' }}>Chargement...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .nav-link:hover { color: #F0F0F5 !important; }
        .stat-card { transition: all 0.2s ease; }
        .stat-card:hover { border-color: rgba(139,92,246,0.3) !important; transform: translateY(-2px); }
        .action-card { transition: all 0.2s ease; cursor: pointer; }
        .action-card:hover { border-color: rgba(139,92,246,0.5) !important; background: rgba(139,92,246,0.08) !important; transform: translateY(-2px); }
        .btn-primary { transition: all 0.2s ease; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes countUp { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>L</div>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{business?.name}</span>
          <button onClick={handleLogout} className="nav-link" style={{ fontSize: '13px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>Déconnexion</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }} className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '4px', letterSpacing: '-0.5px' }}>Tableau de bord</h1>
              <p style={{ color: '#6B7280', fontSize: '13px' }}>{business?.name} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <button className="btn-primary" onClick={() => router.push('/scanner')} style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              📷 Scanner
            </button>
          </div>
        </div>

        {/* Stats principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total clients', value: stats.customers, icon: '👥', color: '#8B5CF6', sub: `+${stats.newThisMonth} ce mois` },
            { label: 'Scans ce mois', value: stats.scansThisMonth, icon: '⚡', color: '#06B6D4', sub: 'points ajoutés' },
            { label: 'Récompenses', value: stats.rewardsTotal, icon: '🎁', color: '#10B981', sub: 'offertes au total' },
            { label: 'Taux de retour', value: `${stats.returnRate}%`, icon: '🔄', color: '#F59E0B', sub: 'sur 30 jours' },
          ].map((stat, i) => (
            <div key={stat.label} className="stat-card fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', animationDelay: `${i * 0.08}s` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{stat.label}</span>
                <span style={{ fontSize: '18px' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: '30px', fontWeight: '700', color: stat.color, marginBottom: '4px', letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#4B5563' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Stats secondaires */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

          {/* Meilleur client */}
          <div className="stat-card fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', animationDelay: '0.32s' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '1rem' }}>⭐ Meilleur client</div>
            {stats.topCustomer ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.2))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '700', color: '#A78BFA', flexShrink: 0 }}>
                  {stats.topCustomer.first_name?.[0]}{stats.topCustomer.last_name?.[0]}
                </div>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '15px', marginBottom: '3px' }}>{stats.topCustomer.first_name} {stats.topCustomer.last_name}</p>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>{stats.topCustomer.visits} visites · {stats.topCustomer.loyalty_points} pts</p>
                </div>
              </div>
            ) : (
              <p style={{ color: '#4B5563', fontSize: '13px' }}>Aucun client encore</p>
            )}
          </div>

          {/* Activité du mois */}
          <div className="stat-card fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', animationDelay: '0.4s' }}>
            <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500', marginBottom: '1rem' }}>📅 Ce mois-ci</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Nouveaux clients', value: stats.newThisMonth, color: '#8B5CF6' },
                { label: 'Scans effectués', value: stats.scansThisMonth, color: '#06B6D4' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '80px', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: item.value > 0 ? '100%' : '0%', background: item.color, borderRadius: '100px', transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: item.color, minWidth: '24px', textAlign: 'right' }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Mes clients', desc: 'Gérez votre liste', icon: '👥', href: '/customers', color: '#8B5CF6' },
            { label: 'Carte fidélité', desc: 'Personnalisez votre carte', icon: '🎴', href: '/cards', color: '#06B6D4' },
            { label: 'Scanner', desc: 'Ajoutez des points', icon: '📷', href: '/scanner', color: '#10B981' },
          ].map((item, i) => (
            <div key={item.label} className="action-card fade-up" onClick={() => router.push(item.href)}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', animationDelay: `${0.48 + i * 0.08}s` }}>
              <div style={{ width: '36px', height: '36px', background: `${item.color}18`, border: `1px solid ${item.color}33`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '0.75rem' }}>{item.icon}</div>
              <p style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.label}</p>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}