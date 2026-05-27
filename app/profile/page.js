'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Profile() {
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', type: '', primary_color: '#8B5CF6' })
  const [activeTab, setActiveTab] = useState('general')
  const router = useRouter()

  const businessTypes = ['Restaurant', 'Boulangerie', 'Café', 'Coiffeur', 'Épicerie', 'Boutique', 'Sport', 'Autre']
  const colors = [
    { hex: '#8B5CF6', name: 'Violet' },
    { hex: '#06B6D4', name: 'Cyan' },
    { hex: '#10B981', name: 'Émeraude' },
    { hex: '#F59E0B', name: 'Or' },
    { hex: '#EC4899', name: 'Rose' },
    { hex: '#EF4444', name: 'Rouge' },
    { hex: '#1D4ED8', name: 'Bleu' },
    { hex: '#F97316', name: 'Orange' },
    { hex: '#111827', name: 'Noir' },
    { hex: '#065F46', name: 'Forêt' },
  ]

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      setForm({
        name: biz.name || '',
        address: biz.address || '',
        type: biz.type || '',
        primary_color: biz.primary_color || '#8B5CF6',
      })
      setLoading(false)
    }
    getData()
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    await supabase.from('businesses').update(form).eq('id', business.id)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6B7280', fontSize: '14px' }}>Chargement...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: #F0F0F5;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.3s;
        }
        .input-field:focus {
          border-color: ${form.primary_color};
          background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px ${form.primary_color}22;
        }
        .input-field::placeholder { color: #4B5563; }

        .select-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 12px 16px;
          color: #F0F0F5;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          cursor: pointer;
          transition: all 0.3s;
          appearance: none;
        }
        .select-field:focus { border-color: ${form.primary_color}; box-shadow: 0 0 0 3px ${form.primary_color}22; }
        .select-field option { background: #1A1A2E; }

        .color-dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          border: 2px solid transparent;
          position: relative;
        }
        .color-dot:hover { transform: scale(1.2); }
        .color-dot.active {
          border-color: #fff;
          box-shadow: 0 0 0 2px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.4);
          transform: scale(1.15);
        }
        .color-dot.active::after {
          content: '✓';
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #fff;
          font-weight: 700;
        }

        .tab { padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
        .tab.active { background: rgba(255,255,255,0.08); color: #F0F0F5; }
        .tab.inactive { background: none; color: #6B7280; }
        .tab:hover { color: #F0F0F5; }

        .btn-save {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 14px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'Space Grotesk', inherit;
          transition: all 0.3s;
          letter-spacing: 0.02em;
          position: relative;
          overflow: hidden;
        }
        .btn-save::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.5s;
        }
        .btn-save:hover::before { left: 100%; }
        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }

        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .float { animation: float 4s ease-in-out infinite; }

        @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 20px ${form.primary_color}33; } 50% { box-shadow: 0 0 40px ${form.primary_color}66; } }
        .glow { animation: glow-pulse 3s ease-in-out infinite; }

        @keyframes shine-text {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shine {
          background: linear-gradient(90deg, #F0F0F5 0%, ${form.primary_color} 40%, #06B6D4 60%, #F0F0F5 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine-text 4s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @keyframes success-bounce { 0% { transform: scale(0.8); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .success-bounce { animation: success-bounce 0.4s ease forwards; }
      `}</style>

      {/* Fond animé */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '700px', height: '700px', background: `radial-gradient(circle, ${form.primary_color}12 0%, transparent 70%)`, borderRadius: '50%', transition: 'background 0.5s' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.018) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '18px', transition: 'color 0.2s' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: `linear-gradient(135deg, ${form.primary_color}, ${form.primary_color}88)`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', transition: 'background 0.4s' }}>L</div>
            <span style={{ fontWeight: '600', fontSize: '15px', fontFamily: 'Space Grotesk, inherit' }}>Loyal<span style={{ color: form.primary_color, transition: 'color 0.4s' }}>Pass</span></span>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>Profil commerçant</span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Hero profil */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="float" style={{ width: '80px', height: '80px', background: `linear-gradient(135deg, ${form.primary_color}, ${form.primary_color}66)`, borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '32px', fontWeight: '800', color: '#fff', boxShadow: `0 12px 40px ${form.primary_color}44`, transition: 'all 0.4s', fontFamily: 'Space Grotesk, inherit' }}>
            {form.name?.[0] || 'L'}
          </div>
          <h1 className="shine" style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px', fontFamily: 'Space Grotesk, inherit', letterSpacing: '-0.5px' }}>
            {form.name || 'Mon Commerce'}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>{form.type || 'Type de commerce'} · {form.address || 'Adresse'}</p>
        </div>

        {/* Tabs */}
        <div className="fade-up" style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '4px', marginBottom: '1.5rem', animationDelay: '0.1s' }}>
          {[
            { id: 'general', label: '⚙️ Général' },
            { id: 'apparence', label: '🎨 Apparence' },
          ].map(tab => (
            <button key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : 'inactive'}`} onClick={() => setActiveTab(tab.id)} style={{ flex: 1 }}>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={save}>
          {activeTab === 'general' && (
            <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1rem', animationDelay: '0.2s' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1.5rem', fontFamily: 'Space Grotesk, inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: form.primary_color }}>01</span> Informations générales
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Nom du commerce</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Le Bistrot du Coin" className="input-field" />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Type de commerce</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select-field">
                    <option value="">Choisissez un type</option>
                    {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Adresse</label>
                  <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Ex : 12 rue de la Paix, Paris" className="input-field" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apparence' && (
            <div className="fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1rem', animationDelay: '0.2s' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1.5rem', fontFamily: 'Space Grotesk, inherit', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: form.primary_color }}>02</span> Couleur de marque
              </h2>

              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Cette couleur sera utilisée sur votre carte fidélité et dans toute l'interface.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {colors.map(c => (
                  <div key={c.hex} title={c.name} className={`color-dot ${form.primary_color === c.hex ? 'active' : ''}`} style={{ background: c.hex }} onClick={() => setForm({ ...form, primary_color: c.hex })} />
                ))}
              </div>

              {/* Prévisualisation */}
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: