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
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      const { data: custs } = await supabase.from('customers').select('*').eq('business_id', biz.id).order('created_at', { ascending: false })
      setCustomers(custs || [])
      setLoading(false)
    }
    getData()
  }, [])

  const addCustomer = async (e) => {
    e.preventDefault()
    setSaving(true)
    const { data, error } = await supabase.from('customers').insert({ ...form, business_id: business.id }).select().single()
    if (!error) {
      setCustomers([data, ...customers])
      setForm({ first_name: '', last_name: '', email: '', phone: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#EF4444']

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
        .input-field { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px 16px; color:#F0F0F5; font-size:14px; font-family:inherit; outline:none; transition:all 0.2s; -webkit-appearance:none; }
        .input-field:focus { border-color:rgba(139,92,246,0.6); background:rgba(255,255,255,0.06); }
        .input-field::placeholder { color:#4B5563; }
        .btn-primary { background:linear-gradient(135deg,#8B5CF6,#6D28D9); border:none; border-radius:12px; padding:11px 20px; color:#fff; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.2s; -webkit-tap-highlight-color:transparent; }
        .btn-primary:hover { opacity:0.85; transform:translateY(-1px); }
        .btn-primary:active { transform:scale(0.97); }
        .btn-ghost { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:11px 20px; color:#9CA3AF; font-size:14px; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .btn-ghost:hover { background:rgba(255,255,255,0.1); }
        .customer-row { display:flex; align-items:center; gap:12px; padding:14px 16px; cursor:pointer; transition:background 0.15s; border-bottom:1px solid rgba(255,255,255,0.04); -webkit-tap-highlight-color:transparent; }
        .customer-row:last-child { border-bottom:none; }
        .customer-row:hover { background:rgba(255,255,255,0.03); }
        .customer-row:active { background:rgba(139,92,246,0.06); }
        @media (max-width:640px) {
          .main-pad { padding:1.25rem 1rem !important; }
          .nav-pad { padding:0 1rem !important; }
          .form-grid { grid-template-columns:1fr !important; }
          .header-row { flex-direction:column !important; align-items:stretch !important; gap:1rem !important; }
          .btn-primary { text-align:center; }
        }
      `}</style>

      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-15%', left:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)', borderRadius:'50%' }} />
      </div>

      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', height:'60px', display:'flex', alignItems:'center', background:'rgba(10,10,15,0.85)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:100 }}>
        <div className="nav-pad" style={{ width:'100%', maxWidth:'800px', margin:'0 auto', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <button onClick={() => router.push('/dashboard')} style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:'20px', padding:'4px', lineHeight:1 }}>←</button>
            <span style={{ fontWeight:'700', fontSize:'15px', fontFamily:'Space Grotesk, sans-serif' }}>Loyal<span style={{ color:'#8B5CF6' }}>Pass</span></span>
          </div>
          <span style={{ fontSize:'12px', color:'#6B7280', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{business?.name}</span>
        </div>
      </nav>

      <div className="main-pad" style={{ maxWidth:'800px', margin:'0 auto', padding:'1.75rem 2rem', position:'relative', zIndex:1 }}>

        <div className="header-row fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div>
            <h1 style={{ fontSize:'clamp(20px,5vw,24px)', fontWeight:'700', letterSpacing:'-0.5px', fontFamily:'Space Grotesk, sans-serif' }}>Mes clients</h1>
            <p style={{ color:'#6B7280', fontSize:'13px', marginTop:'3px' }}>{customers.length} client{customers.length > 1 ? 's' : ''}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Annuler' : '+ Ajouter'}
          </button>
        </div>

        {showForm && (
          <div className="fade-up" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'20px', padding:'1.5rem', marginBottom:'1rem' }}>
            <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'1.25rem', fontFamily:'Space Grotesk, sans-serif' }}>Nouveau client</h3>
            <form onSubmit={addCustomer}>
              <div className="form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.875rem', marginBottom:'1rem' }}>
                {[
                  { label:'Prénom', key:'first_name', placeholder:'Jean', required:true },
                  { label:'Nom', key:'last_name', placeholder:'Dupont', required:true },
                  { label:'Email', key:'email', placeholder:'jean@email.com', required:false },
                  { label:'Téléphone', key:'phone', placeholder:'06 00 00 00 00', required:false },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize:'11px', color:'#9CA3AF', marginBottom:'6px', display:'block', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:'500' }}>{field.label}</label>
                    <input type="text" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} placeholder={field.placeholder} required={field.required} className="input-field" />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Enregistrement...' : '✓ Enregistrer'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Annuler</button>
              </div>
            </form>
          </div>
        )}

        <div className="fade-up" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'4px 16px', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px', animationDelay:'0.1s' }}>
          <span style={{ fontSize:'16px', opacity:0.5 }}>🔍</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client..." className="input-field" style={{ background:'transparent', border:'none', padding:'10px 0', fontSize:'14px' }} />
        </div>

        {filtered.length === 0 ? (
          <div className="fade-up" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'4rem 2rem', textAlign:'center', animationDelay:'0.2s' }}>
            <div style={{ fontSize:'40px', marginBottom:'1rem' }}>👥</div>
            <p style={{ color:'#6B7280', fontSize:'14px' }}>{search ? 'Aucun résultat' : 'Aucun client pour l\'instant'}</p>
            {!search && <p style={{ color:'#4B5563', fontSize:'12px', marginTop:'6px' }}>Ajoutez votre premier client ci-dessus</p>}
          </div>
        ) : (
          <div className="fade-up" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', overflow:'hidden', animationDelay:'0.2s' }}>
            {filtered.map((c, i) => (
              <div key={c.id} className="customer-row" onClick={() => router.push(`/customers/${c.id}`)}>
                <div style={{ width:'42px', height:'42px', borderRadius:'50%', background:`${colors[i % colors.length]}22`, border:`1px solid ${colors[i % colors.length]}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:'600', color:colors[i % colors.length], flexShrink:0 }}>
                  {c.first_name?.[0]}{c.last_name?.[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:'500', fontSize:'14px', marginBottom:'2px' }}>{c.first_name} {c.last_name}</p>
                  <p style={{ fontSize:'12px', color:'#6B7280', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.email || c.phone || 'Pas de contact'}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ fontSize:'16px', fontWeight:'700', color:'#8B5CF6' }}>{c.loyalty_points} pts</p>
                  <p style={{ fontSize:'11px', color:'#6B7280' }}>{c.visits} visite{c.visits > 1 ? 's' : ''}</p>
                </div>
                <div style={{ color:'#4B5563', fontSize:'18px', flexShrink:0 }}>›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}