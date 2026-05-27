'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [business, setBusiness] = useState(null)
  const [stats, setStats] = useState({ customers: 0, scans: 0, rewards: 0 })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setBusiness(biz)

      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)

      const { count: scanCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)

      const { count: rewardCount } = await supabase
        .from('rewards')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', biz.id)

      setStats({ customers: customerCount || 0, scans: scanCount || 0, rewards: rewardCount || 0 })
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
        .card:hover { border-color: rgba(139, 92, 246, 0.4) !important; transform: translateY(-1px); }
        .card { transition: all 0.2s ease; }
        .action-card:hover { border-color: rgba(139, 92, 246, 0.5) !important; background: rgba(139, 92, 246, 0.08) !important; }
        .action-card { transition: all 0.2s ease; cursor: pointer; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-primary { transition: all 0.2s ease; }
      `}</style>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>L</div>
          <span style={{ fontWeight: '600', fontSize: '15px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>{business?.name}</span>
          <button onClick={handleLogout} className="nav-link" style={{ fontSize: '13px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Bonjour 👋
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Tableau de bord — <span style={{ color: '#9CA3AF' }}>{business?.name}</span>
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Clients actifs', value: stats.customers, icon: '👥', color: '#8B5CF6' },
            { label: 'Scans totaux', value: stats.scans, icon: '⚡', color: '#06B6D4' },
            { label: 'Récompenses', value: stats.rewards, icon: '🎁', color: '#10B981' },
            { label: 'Taux de retour', value: '—', icon: '📈', color: '#F59E0B' },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{stat.label}</span>
                <span style={{ fontSize: '18px' }}>{stat.icon}</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Action principale */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="btn-primary"
            onClick={() => router.push('/scanner')}
            style={{ width: '100%', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', border: 'none', borderRadius: '16px', padding: '1.25rem 2rem', color: '#fff', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
          >
            <span style={{ fontSize: '22px' }}>📷</span>
            Scanner un client
          </button>
        </div>

        {/* Actions secondaires */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Mes clients', desc: 'Gérez et ajoutez des clients', icon: '👥', href: '/customers' },
            { label: 'Ma carte fidélité', desc: 'Personnalisez votre programme', icon: '🎴', href: '/cards' },
          ].map((item) => (
            <div
              key={item.label}
              className="action-card"
              onClick={() => router.push(item.href)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '0.75rem' }}>{item.icon}</div>
              <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>💡</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '3px' }}>Conseil du jour</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>Ajoutez vos premiers clients et créez votre carte fidélité pour commencer à fidéliser.</div>
          </div>
        </div>

      </div>
    </div>
  )
}