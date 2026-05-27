'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'

export default function CustomerDetail({ params }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase
        .from('customers').select('*').eq('id', params.id).single()
      setCustomer(data)
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
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6B7280', fontSize: '14px' }}>Chargement...</div>
    </div>
  )

  const initials = `${customer?.first_name?.[0] || ''}${customer?.last_name?.[0] || ''}`

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn-primary { background: linear-gradient(135deg, #8B5CF6, #6D28D9); border: none; border-radius: 12px; padding: 11px 20px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s, transform 0.2s; }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }
        .stat-card:hover { border-color: rgba(139,92,246,0.3) !important; }
        .stat-card { transition: border-color 0.2s; }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/customers')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '18px' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>L</div>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
          </div>
        </div>
        <button className="btn-primary" onClick={() => router.push(`/scanner?code=${customer?.qr_code}`)}>
          📷 Scanner ce client
        </button>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Header client */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.2))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '700', color: '#A78BFA', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '4px' }}>{customer?.first_name} {customer?.last_name}</h1>
              <p style={{ fontSize: '13px', color: '#6B7280' }}>{customer?.email || customer?.phone || 'Pas de contact'}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Points', value: customer?.loyalty_points, color: '#8B5CF6', icon: '⚡' },
              { label: 'Visites', value: customer?.visits, color: '#06B6D4', icon: '📍' },
              { label: 'Récompenses', value: '0', color: '#10B981', icon: '🎁' },
            ].map(stat => (
              <div key={stat.label} className="stat-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
                <div style={{ fontSize: '26px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
                <div style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* QR Code */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>QR Code client</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '2rem' }}>Scannez ce code pour ajouter des points</p>

          <div style={{ display: 'inline-block', padding: '1.5rem', background: '#fff', borderRadius: '20px', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}>
            <QRCodeCanvas value={customer?.qr_code || ''} size={180} level="H" />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Code unique</label>
            <input
              type="text"
              readOnly
              value={customer?.qr_code || ''}
              onFocus={(e) => e.target.select()}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '11px 16px', color: '#9CA3AF', fontSize: '12px', fontFamily: 'monospace', outline: 'none', textAlign: 'center' }}
            />
          </div>

          <button
            onClick={copyCode}
            style={{ background: copied ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(139,92,246,0.3)'}`, borderRadius: '12px', padding: '11px 24px', color: copied ? '#10B981' : '#A78BFA', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          >
            {copied ? '✓ Copié !' : 'Copier le code'}
          </button>
        </div>
      </div>
    </div>
  )
}