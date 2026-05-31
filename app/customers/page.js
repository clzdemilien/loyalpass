'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'

export default function CustomerDetail({ params }) {
  const [customer, setCustomer] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loyaltyCard, setLoyaltyCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      const { data: cust } = await supabase.from('customers').select('*').eq('id', params.id).single()
      setCustomer(cust)
      const { data: card } = await supabase.from('loyalty_cards').select('*').eq('business_id', biz.id).single()
      setLoyaltyCard(card)
      const { data: txs } = await supabase.from('transactions').select('*').eq('customer_id', params.id).order('created_at', { ascending: false }).limit(10)
      setTransactions(txs || [])
      setLoading(false)
    }
    getData()
  }, [params.id])

  const copyCode = () => {
    if (!customer?.qr_code) return
    const el = document.createElement('textarea')
    el.value = customer.qr_code
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const pct = loyaltyCard && customer ? Math.min((customer.loyalty_points / loyaltyCard.points_required) * 100, 100) : 0

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff/60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff/3600)}h`
    if (diff < 604800) return `Il y a ${Math.floor(diff/86400)} jour${Math.floor(diff/86400) > 1 ? 's' : ''}`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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
        @keyframes shimmer { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .btn-scan {
          background: linear-gradient(135deg, #8B5CF6, #6D28D9);
          border: none; border-radius: 16px; padding: 17px;
          color: #fff; font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: 'Space Grotesk', sans-serif;
          width: 100%; transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
          letter-spacing: -0.3px; position: relative; overflow: hidden;
        }
        .btn-scan::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s;
        }
        .btn-scan:hover::before { left: 100%; }
        .btn-scan:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(139,92,246,0.4); }
        .btn-scan:active { transform: scale(0.97); }
        .btn-copy {
          border: none; border-radius: 12px; padding: 12px 24px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: inherit; transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-copy:active { transform: scale(0.96); }
        .tx-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .tx-row:last-child { border-bottom: none; }
        .tx-row:hover { background: rgba(255,255,255,0.02); }
        .stat-card { transition: all 0.2s; }
        .stat-card:hover { border-color: rgba(139,92,246,0.3) !important; transform: translateY(-2px); }
        .qr-code-text {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 16px;
          color: #E5E7EB;
          font-size: 11px;
          font-family: monospace;
          text-align: center;
          word-break: break-all;
          line-height: 1.6;
          cursor: text;
          user-select: all;
          -webkit-user-select: all;
          margin-bottom: 1rem;
          transition: border-color 0.2s;
        }
        .qr-code-text:hover { border-color: rgba(139,92,246,0.3); }
        @media (max-width: 640px) {
          .main-pad { padding: 1.25rem 1rem !important; }
          .nav-pad { padding: 0 1rem !important; }
          .stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>

      {/* Fond */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 65%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', height: '60px', display: 'flex', alignItems: 'center', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="nav-pad" style={{ width: '100%', maxWidth: '680px', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => router.push('/customers')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '20px', padding: '4px', lineHeight: 1 }}>←</button>
            <span style={{ fontWeight: '700', fontSize: '15px', fontFamily: 'Space Grotesk, sans-serif' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
          </div>
          <button onClick={() => router.push(`/scanner?code=${customer?.qr_code}`)} style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '10px', padding: '7px 14px', color: '#A78BFA', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            📷 Scanner
          </button>
        </div>
      </nav>

      <div className="main-pad" style={{ maxWidth: '680px', margin: '0 auto', padding: '1.75rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Header client */}
        <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '1.75rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(109,40,217,0.2))', border: '2px solid rgba(139,92,246,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: '#A78BFA', fontFamily: 'Space Grotesk, sans-serif' }}>
                {customer?.first_name?.[0]}{customer?.last_name?.[0]}
              </div>
              {customer?.visits > 5 && (
                <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '22px', height: '22px', background: '#F59E0B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', border: '2px solid #0A0A0F' }}>⭐</div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 'clamp(18px,4vw,22px)', fontWeight: '800', letterSpacing: '-0.5px', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '4px' }}>
                {customer?.first_name} {customer?.last_name}
              </h1>
              <p style={{ fontSize: '13px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customer?.email || customer?.phone || 'Pas de contact'}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: loyaltyCard ? '1.25rem' : '0' }}>
            {[
              { label: 'Points', value: customer?.loyalty_points, color: '#8B5CF6', icon: '⚡' },
              { label: 'Visites', value: customer?.visits, color: '#06B6D4', icon: '📍' },
              { label: 'Récomp.', value: transactions.length > 0 ? '✓' : '—', color: '#10B981', icon: '🎁' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', marginBottom: '6px' }}>{s.icon}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: s.color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '4px' }}>{s.value}</div>
                <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Barre de progression */}
          {loyaltyCard && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                <span style={{ color: '#9CA3AF' }}>{customer?.loyalty_points} / {loyaltyCard.points_required} pts</span>
                <span style={{ color: '#F59E0B', fontWeight: '600' }}>🎁 {loyaltyCard.reward}</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #8B5CF6, #F59E0B)', borderRadius: '100px', transition: 'width 0.8s ease' }} />
              </div>
              {pct >= 80 && (
                <p style={{ fontSize: '11px', color: '#F59E0B', marginTop: '6px', textAlign: 'center' }}>
                  🔥 Plus que {loyaltyCard.points_required - (customer?.loyalty_points || 0)} point{loyaltyCard.points_required - (customer?.loyalty_points || 0) > 1 ? 's' : ''} !
                </p>
              )}
            </div>
          )}
        </div>

        {/* Bouton scanner */}
        <div className="fade-up" style={{ marginBottom: '1rem', animationDelay: '0.1s' }}>
          <button className="btn-scan" onClick={() => router.push(`/scanner?code=${customer?.qr_code}`)}>
            ⚡ Ajouter des points à {customer?.first_name}
          </button>
        </div>

        {/* QR Code */}
        <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center', animationDelay: '0.2s' }}>
          <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', fontFamily: 'Space Grotesk, sans-serif' }}>QR Code client</h2>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '1.5rem' }}>À montrer ou scanner pour ajouter des points</p>

          <div style={{ display: 'inline-block', padding: '1.25rem', background: '#fff', borderRadius: '20px', marginBottom: '1.25rem', boxShadow: '0 0 40px rgba(139,92,246,0.25)' }}>
            <QRCodeCanvas value={customer?.qr_code || ''} size={160} level="H" />
          </div>

          {/* Code texte cliquable */}
          <div
            className="qr-code-text"
            onClick={copyCode}
            title="Cliquez pour copier"
          >
            {customer?.qr_code || '—'}
          </div>

          <button
            onClick={copyCode}
            className="btn-copy"
            style={{
              background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(139,92,246,0.12)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`,
              color: copied ? '#10B981' : '#A78BFA',
            }}
          >
            {copied ? '✓ Code copié !' : '📋 Copier le code'}
          </button>
        </div>

        {/* Historique */}
        {transactions.length > 0 && (
          <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', overflow: 'hidden', animationDelay: '0.3s' }}>
            <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', fontFamily: 'Space Grotesk, sans-serif' }}>Historique des visites</h2>
            </div>
            {transactions.map((tx) => (
              <div key={tx.id} className="tx-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>⚡</div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500' }}>Visite enregistrée</p>
                    <p style={{ fontSize: '11px', color: '#6B7280' }}>{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#8B5CF6' }}>+{tx.points_added} pt{tx.points_added > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}