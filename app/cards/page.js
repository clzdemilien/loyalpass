'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Cards() {
  const [business, setBusiness] = useState(null)
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: '', points_required: 10, reward: '' })
  const [activeColor, setActiveColor] = useState('#8B5CF6')
  const router = useRouter()

  const colors = [
    { hex: '#8B5CF6', label: 'Violet' },
    { hex: '#06B6D4', label: 'Cyan' },
    { hex: '#10B981', label: 'Vert' },
    { hex: '#F59E0B', label: 'Or' },
    { hex: '#EC4899', label: 'Rose' },
    { hex: '#EF4444', label: 'Rouge' },
    { hex: '#1D4ED8', label: 'Bleu' },
    { hex: '#111827', label: 'Noir' },
  ]

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz?.primary_color) setActiveColor(biz.primary_color)
      const { data: existingCard } = await supabase.from('loyalty_cards').select('*').eq('business_id', biz.id).single()
      if (existingCard) {
        setCard(existingCard)
        setForm({ name: existingCard.name, points_required: existingCard.points_required, reward: existingCard.reward })
      }
      setLoading(false)
    }
    getData()
  }, [])

  const saveCard = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await supabase.from('businesses').update({ primary_color: activeColor }).eq('id', business.id)

    if (card) {
      await supabase.from('loyalty_cards').update(form).eq('id', card.id)
    } else {
      const { data } = await supabase.from('loyalty_cards').insert({ ...form, business_id: business.id }).select().single()
      setCard(data)
    }
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#6B7280', fontSize: '14px' }}>Chargement...</div>
    </div>
  )

  const dots = Array.from({ length: Math.min(form.points_required, 12) })

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input-field { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 16px; color: #F0F0F5; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(139,92,246,0.6); background: rgba(139,92,246,0.03); }
        .input-field::placeholder { color: #4B5563; }
        .color-swatch { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 2px solid transparent; }
        .color-swatch:hover { transform: scale(1.2); }
        .color-swatch.active { transform: scale(1.15); box-shadow: 0 0 0 3px rgba(255,255,255,0.3); }
        .btn-save { width: 100%; border: none; border-radius: 14px; padding: 14px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s, transform 0.2s; }
        .btn-save:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .card-preview { border-radius: 24px; padding: 1.75rem; position: relative; overflow: hidden; transition: background 0.4s; }
        .card-preview::before { content: ''; position: absolute; top: -30%; right: -10%; width: 200px; height: 200px; background: rgba(255,255,255,0.08); border-radius: 50%; pointer-events: none; }
        .card-preview::after { content: ''; position: absolute; bottom: -20%; left: -5%; width: 150px; height: 150px; background: rgba(255,255,255,0.05); border-radius: 50%; pointer-events: none; }
        .dot { width: 24px; height: 24px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); transition: background 0.3s; }
        .dot.filled { background: rgba(255,255,255,0.85); border-color: transparent; }
        @keyframes shimmer { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        .shimmer { animation: shimmer 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
        .range-input { -webkit-appearance: none; width: 100%; height: 4px; border-radius: 100px; outline: none; cursor: pointer; }
        .range-input::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #8B5CF6; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(139,92,246,0.4); }
      `}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '500px', height: '500px', background: `radial-gradient(circle, ${activeColor}18 0%, transparent 70%)`, borderRadius: '50%', transition: 'background 0.4s' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '18px' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>L</div>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>{business?.name}</span>
      </nav>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>

        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>Ma carte fidélité</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Personnalisez votre programme de fidélité</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Formulaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem' }}>
              <form onSubmit={saveCard} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Nom de la carte</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Carte VIP Bistrot" required className="input-field" />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>
                    Points requis — <span style={{ color: '#8B5CF6', fontWeight: '700' }}>{form.points_required}</span>
                  </label>
                  <input
                    type="range" min="1" max="30" value={form.points_required}
                    onChange={(e) => setForm({ ...form, points_required: parseInt(e.target.value) })}
                    className="range-input"
                    style={{ background: `linear-gradient(to right, #8B5CF6 ${(form.points_required / 30) * 100}%, rgba(255,255,255,0.1) ${(form.points_required / 30) * 100}%)` }}
                  />
                  <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>Récompense après {form.points_required} visite{form.points_required > 1 ? 's' : ''}</p>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Récompense</label>
                  <input type="text" value={form.reward} onChange={(e) => setForm({ ...form, reward: e.target.value })} placeholder="Ex : 1 café offert" required className="input-field" />
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Couleur</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {colors.map(c => (
                      <div
                        key={c.hex}
                        className={`color-swatch ${activeColor === c.hex ? 'active' : ''}`}
                        style={{ background: c.hex }}
                        onClick={() => setActiveColor(c.hex)}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-save"
                  style={{ background: saved ? 'linear-gradient(135deg, #10B981, #059669)' : `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                >
                  {saving ? '⏳ Enregistrement...' : saved ? '✓ Carte enregistrée !' : card ? '💾 Mettre à jour' : '🚀 Créer ma carte'}
                </button>
              </form>
            </div>
          </div>

          {/* Aperçu carte */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.25rem' }}>
              <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Aperçu en direct</p>

              <div className="card-preview" style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}88)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <p style={{ fontWeight: '700', fontSize: '16px', color: '#fff', marginBottom: '3px' }}>{business?.name || 'Mon Commerce'}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{form.name || 'Carte fidélité'}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', color: '#fff', fontWeight: '600' }}>
                    WALLET
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points fidélité</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
                    0 <span style={{ fontSize: '16px', fontWeight: '400', opacity: 0.6 }}>/ {form.points_required}</span>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {dots.map((_, i) => (
                    <div key={i} className="dot" />
                  ))}
                  {form.points_required > 12 && (
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', alignSelf: 'center' }}>+{form.points_required - 12}</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>🎁 {form.reward || 'Votre récompense'}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', padding: '5px', borderRadius: '6px' }}>
                    {[1,0,1,0,1,0,1,0,1].map((v,i) => (
                      <div key={i} style={{ background: v ? 'rgba(255,255,255,0.8)' : 'transparent', borderRadius: '1px' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', background: `${activeColor}22`, border: `1px solid ${activeColor}44`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>💡</div>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '500', marginBottom: '3px' }}>Conseil</p>
                  <p style={{ fontSize: '11px', color: '#6B7280', lineHeight: 1.5 }}>Entre 5 et 10 points est idéal pour fidéliser sans décourager vos clients.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}