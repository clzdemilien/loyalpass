'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: biz } = await supabase
        .from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)

      const { data: custs } = await supabase
        .from('customers').select('*').eq('business_id', biz.id)
        .order('created_at', { ascending: false })
      setCustomers(custs || [])
      setLoading(false)
    }
    getData()
  }, [])

  const addCustomer = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase
      .from('customers').insert({ ...form, business_id: business.id }).select().single()
    if (!error) { setCustomers([data, ...customers]); setForm({ first_name: '', last_name: '', email: '', phone: '' }); setShowForm(false) }
    setSaving(false)
  }

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#EF4444']

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
        .input-field { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 11px 16px; color: #F0F0F5; font-size: 14px; font-family: inherit; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: rgba(139,92,246,0.6); }
        .input-field::placeholder { color: #4B5563; }
        .customer-row:hover { background: rgba(255,255,255,0.04) !important; }
        .customer-row { transition: background 0.15s; cursor: pointer; }
        .btn-primary { background: linear-gradient(135deg, #8B5CF6, #6D28D9); border: none; border-radius: 12px; padding: 10px 20px; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s; }
        .btn-primary:hover { opacity: 0.85; }
        .btn-ghost { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 20px; color: #9CA3AF; font-size: 13px; cursor: pointer; font-family: inherit; transition: background 0.2s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>L</div>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>{business?.name}</span>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '4px' }}>Mes clients</h1>
            <p style={{ color: '#6B7280', fontSize: '13px' }}>{customers.length} client{customers.length > 1 ? 's' : ''} au total</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            + Ajouter un client
          </button>
        </div>

        {showForm && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '1.25rem' }}>Nouveau client</h3>
            <form onSubmit={addCustomer}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Prénom', key: 'first_name', placeholder: 'Jean', required: true },
                  { label: 'Nom', key: 'last_name', placeholder: 'Dupont', required: true },
                  { label: 'Email', key: 'email', placeholder: 'jean@email.com', required: false },
                  { label: 'Téléphone', key: 'phone', placeholder: '06 00 00 00 00', required: false },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>{field.label}</label>
                    <input
                      type="text"
                      value={form[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="input-field"
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  Rechercher un client..."
            className="input-field"
            style={{ background: 'transparent', border: 'none', padding: '6px 8px' }}
          />
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '1rem' }}>👥</div>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              {search ? 'Aucun client trouvé' : 'Aucun client pour l\'instant'}
            </p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', overflow: 'hidden' }}>
            {filtered.map((c, i) => (
              <div
                key={c.id}
                className="customer-row"
                onClick={() => router.push(`/customers/${c.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${colors[i % colors.length]}22`, border: `1px solid ${colors[i % colors.length]}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: colors[i % colors.length], flexShrink: 0 }}>
                  {c.first_name?.[0]}{c.last_name?.[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>{c.first_name} {c.last_name}</p>
                  <p style={{ fontSize: '12px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email || c.phone || 'Pas de contact'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#8B5CF6' }}>{c.loyalty_points} pts</p>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>{c.visits} visite{c.visits > 1 ? 's' : ''}</p>
                </div>
                <div style={{ color: '#4B5563', fontSize: '18px' }}>›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}