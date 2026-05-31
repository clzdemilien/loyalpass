'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Scanner() {
  const [business, setBusiness] = useState(null)
  const [scannedCode, setScannedCode] = useState('')
  const [customer, setCustomer] = useState(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)
  const [rewardText, setRewardText] = useState('')
  const [pointsToAdd, setPointsToAdd] = useState(1)
  const [loyaltyCard, setLoyaltyCard] = useState(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const inputRef = useRef(null)
  const html5QrRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      const { data: card } = await supabase.from('loyalty_cards').select('*').eq('business_id', biz.id).single()
      setLoyaltyCard(card)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) { setScannedCode(code); setTimeout(() => searchCustomerByCode(code, biz.id), 500) }
    }
    getData()
    return () => stopCamera()
  }, [])

  const startCamera = async () => {
    setCameraError('')
    setCameraOpen(true)
    setTimeout(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        html5QrRef.current = new Html5Qrcode('qr-reader')
        await html5QrRef.current.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => { setScannedCode(decodedText); stopCamera(); searchCustomerByCode(decodedText, business?.id) },
          () => {}
        )
      } catch {
        setCameraError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
        setCameraOpen(false)
      }
    }, 300)
  }

  const stopCamera = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); html5QrRef.current = null } catch (e) {}
    }
    setCameraOpen(false)
  }

  const searchCustomerByCode = async (code, bizId) => {
    if (!code?.trim()) return
    setLoading(true); setCustomer(null); setMessage('')
    const { data, error } = await supabase.from('customers').select('*')
      .eq('qr_code', code.trim()).eq('business_id', bizId || business?.id).single()
    if (error || !data) { setMessage('Client introuvable'); setMessageType('error') }
    else setCustomer(data)
    setLoading(false)
  }

  const addPoints = async () => {
    if (!customer) return
    setLoading(true)
    const newPoints = customer.loyalty_points + pointsToAdd
    const newVisits = customer.visits + 1
    await supabase.from('customers').update({ loyalty_points: newPoints, visits: newVisits, last_visit: new Date().toISOString() }).eq('id', customer.id)
    await supabase.from('transactions').insert({ customer_id: customer.id, business_id: business.id, points_added: pointsToAdd })
    const rewardReached = loyaltyCard && newPoints >= loyaltyCard.points_required
    if (rewardReached) {
      await supabase.from('rewards').insert({ customer_id: customer.id, business_id: business.id, reward_text: loyaltyCard.reward, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
      await supabase.from('customers').update({ loyalty_points: 0 }).eq('id', customer.id)
      setRewardText(loyaltyCard.reward)
      setShowFireworks(true)
      setCustomer({ ...customer, loyalty_points: 0, visits: newVisits })
      setTimeout(() => setShowFireworks(false), 5000)
    } else {
      setMessage(`✓ +${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''} ajouté${pointsToAdd > 1 ? 's' : ''} à ${customer.first_name} !`)
      setMessageType('success')
      setCustomer({ ...customer, loyalty_points: newPoints, visits: newVisits })
    }
    setScannedCode('')
    setLoading(false)
  }

  const pct = loyaltyCard && customer ? Math.min((customer.loyalty_points / loyaltyCard.points_required) * 100, 100) : 0

  const particles = Array.from({ length: 60 }, (_, i) => ({
    color: ['#8B5CF6','#06B6D4','#F59E0B','#EC4899','#10B981','#fff','#F87171','#A78BFA'][i % 8],
    x: `${(Math.random()-0.5)*600}px`, y: `${(Math.random()-0.5)*600}px`,
    delay: `${Math.random()}s`, duration: `${0.8+Math.random()}s`,
    left: `${20+Math.random()*60}%`, top: `${20+Math.random()*60}%`,
    size: `${4+Math.random()*8}px`,
  }))

  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', color:'#F0F0F5', fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes scanline { 0%{top:10%}50%{top:85%}100%{top:10%} }
        @keyframes particle-fly { 0%{transform:translate(0,0) scale(1);opacity:1;} 100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0;} }
        @keyframes reward-pop { 0%{transform:scale(0.5);opacity:0;} 60%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
        @keyframes shine { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes warm-glow { 0%,100%{box-shadow:0 0 30px rgba(245,158,11,0.2);} 50%{box-shadow:0 0 60px rgba(245,158,11,0.35);} }
        .fade-up { animation:fadeUp 0.5s ease forwards; }
        .particle { position:absolute; border-radius:50%; animation:particle-fly var(--dur) ease-out var(--delay) forwards; }
        .reward-card { animation:reward-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .shine-text { background:linear-gradient(90deg,#F59E0B,#EC4899,#8B5CF6,#06B6D4,#F59E0B); background-size:200% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:shine 3s linear infinite; }
        .btn-camera { background:linear-gradient(135deg,rgba(245,158,11,0.15),rgba(236,72,153,0.1)); border:1px solid rgba(245,158,11,0.35); border-radius:16px; padding:18px; color:#F59E0B; font-size:16px; font-weight:700; cursor:pointer; font-family:inherit; width:100%; display:flex; align-items:center; justify-content:center; gap:10px; transition:all 0.2s; -webkit-tap-highlight-color:transparent; }
        .btn-camera:hover { background:linear-gradient(135deg,rgba(245,158,11,0.25),rgba(236,72,153,0.15)); transform:translateY(-1px); }
        .btn-camera:active { transform:scale(0.97); }
        .btn-stop { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.25); border-radius:16px; padding:18px; color:#F87171; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; width:100%; transition:all 0.2s; }
        .btn-add { width:100%; background:linear-gradient(135deg,#8B5CF6,#6D28D9); border:none; border-radius:18px; padding:20px; color:#fff; font-size:18px; font-weight:800; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all 0.2s; -webkit-tap-highlight-color:transparent; letter-spacing:-0.3px; }
        .btn-add:hover { opacity:0.9; transform:translateY(-2px); box-shadow:0 12px 40px rgba(139,92,246,0.4); }
        .btn-add:active { transform:scale(0.97); }
        .btn-add:disabled { opacity:0.4; transform:none; cursor:not-allowed; }
        .pts-btn { width:52px; height:52px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; color:#F0F0F5; font-size:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-family:inherit; transition:all 0.15s; -webkit-tap-highlight-color:transparent; }
        .pts-btn:active { background:rgba(255,255,255,0.15); transform:scale(0.92); }
        .input-scan { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px 16px; color:#F0F0F5; font-size:15px; font-family:monospace; outline:none; transition:border-color 0.2s; -webkit-appearance:none; }
        .input-scan:focus { border-color:rgba(139,92,246,0.5); }
        .input-scan::placeholder { color:#4B5563; font-family:inherit; }
        .btn-search { background:linear-gradient(135deg,#8B5CF6,#6D28D9); border:none; border-radius:14px; padding:14px 18px; color:#fff; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; -webkit-tap-highlight-color:transparent; white-space:nowrap; }
        #qr-reader { width:100% !important; }
        #qr-reader video { width:100% !important; border-radius:16px; }
        #qr-reader img { display:none !important; }
        .scanline { position:absolute; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#F59E0B,transparent); animation:scanline 2s ease-in-out infinite; }
        @media (max-width:640px) {
          .main-pad { padding:1.25rem 1rem !important; }
          .nav-pad { padding:0 1rem !important; }
          .search-row { flex-direction:column !important; gap:8px !important; }
        }
      `}</style>

      {/* Feux d'artifice */}
      {showFireworks && (
        <div style={{ position:'fixed', inset:0, zIndex:999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.88)', backdropFilter:'blur(8px)', padding:'1rem' }} onClick={() => setShowFireworks(false)}>
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{ width:p.size, height:p.size, background:p.color, left:p.left, top:p.top, '--tx':p.x, '--ty':p.y, '--dur':p.duration, '--delay':p.delay }} />
          ))}
          <div className="reward-card" style={{ background:'rgba(10,10,15,0.97)', border:'1px solid rgba(245,158,11,0.4)', borderRadius:'28px', padding:'2.5rem 2rem', textAlign:'center', zIndex:1000, maxWidth:'360px', width:'100%', boxShadow:'0 0 80px rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize:'56px', marginBottom:'1rem' }}>🎉</div>
            <div style={{ fontSize:'24px', fontWeight:'800', marginBottom:'10px', fontFamily:'Space Grotesk, sans-serif' }} className="shine-text">Récompense débloquée !</div>
            <div style={{ fontSize:'18px', color:'#F59E0B', fontWeight:'600', marginBottom:'1rem' }}>{rewardText}</div>
            <div style={{ fontSize:'14px', color:'#6B7280', lineHeight:1.6, marginBottom:'1.5rem' }}>
              Merci pour votre fidélité — vous êtes incroyable ! ✨
            </div>
            <div style={{ fontSize:'12px', color:'#4B5563', background:'rgba(255,255,255,0.04)', borderRadius:'100px', padding:'6px 16px', display:'inline-block' }}>Appuyez pour fermer</div>
          </div>
        </div>
      )}

      {/* Fond chaleureux */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'-20%', right:'-10%', width:'600px', height:'600px', background:'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-15%', left:'-10%', width:'500px', height:'500px', background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', top:'40%', left:'30%', width:'300px', height:'300px', background:'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 65%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />
      </div>

      {/* Navbar */}
      <nav style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', height:'60px', display:'flex', alignItems:'center', background:'rgba(10,10,15,0.85)', backdropFilter:'blur(16px)', position:'sticky', top:0, zIndex:100 }}>
        <div className="nav-pad" style={{ width:'100%', maxWidth:'600px', margin:'0 auto', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <button onClick={() => { stopCamera(); router.push('/dashboard') }} style={{ background:'none', border:'none', color:'#6B7280', cursor:'pointer', fontSize:'20px', padding:'4px', lineHeight:1 }}>←</button>
            <span style={{ fontWeight:'700', fontSize:'15px', fontFamily:'Space Grotesk, sans-serif' }}>Loyal<span style={{ color:'#8B5CF6' }}>Pass</span></span>
          </div>
          <span style={{ fontSize:'12px', color:'#6B7280', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{business?.name}</span>
        </div>
      </nav>

      <div className="main-pad" style={{ maxWidth:'600px', margin:'0 auto', padding:'1.75rem 1.5rem', position:'relative', zIndex:1 }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom:'1.75rem' }}>
          <h1 style={{ fontSize:'clamp(22px,5vw,26px)', fontWeight:'800', letterSpacing:'-0.5px', fontFamily:'Space Grotesk, sans-serif', marginBottom:'4px' }}>
            Scanner un client
          </h1>
          <p style={{ color:'#6B7280', fontSize:'13px' }}>Caméra ou saisie manuelle du code</p>
        </div>

        {/* Zone scan */}
        <div className="fade-up" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'24px', padding:'1.5rem', marginBottom:'1rem', animationDelay:'0.1s' }}>

          <button onClick={cameraOpen ? stopCamera : startCamera} className={cameraOpen ? 'btn-stop' : 'btn-camera'} style={{ marginBottom:'1rem' }}>
            {cameraOpen ? '⏹ Fermer la caméra' : '📷 Scanner avec la caméra'}
          </button>

          {cameraOpen && (
            <div style={{ marginBottom:'1rem', background:'#000', borderRadius:'20px', overflow:'hidden', position:'relative', minHeight:'280px' }}>
              <div id="qr-reader" />
              {/* Overlay corners */}
              <div style={{ position:'absolute', inset:0, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:'210px', height:'210px', position:'relative' }}>
                  <div style={{ position:'absolute', top:0, left:0, width:'28px', height:'28px', borderTop:'3px solid #F59E0B', borderLeft:'3px solid #F59E0B', borderRadius:'6px 0 0 0' }} />
                  <div style={{ position:'absolute', top:0, right:0, width:'28px', height:'28px', borderTop:'3px solid #F59E0B', borderRight:'3px solid #F59E0B', borderRadius:'0 6px 0 0' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, width:'28px', height:'28px', borderBottom:'3px solid #F59E0B', borderLeft:'3px solid #F59E0B', borderRadius:'0 0 0 6px' }} />
                  <div style={{ position:'absolute', bottom:0, right:0, width:'28px', height:'28px', borderBottom:'3px solid #F59E0B', borderRight:'3px solid #F59E0B', borderRadius:'0 0 6px 0' }} />
                  <div className="scanline" />
                </div>
              </div>
              <div style={{ position:'absolute', bottom:'12px', left:'50%', transform:'translateX(-50%)', background:'rgba(0,0,0,0.6)', borderRadius:'100px', padding:'6px 14px', fontSize:'12px', color:'rgba(255,255,255,0.6)', whiteSpace:'nowrap' }}>
                Pointez vers le QR code
              </div>
            </div>
          )}

          {cameraError && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'12px', padding:'12px', fontSize:'13px', color:'#F87171', marginBottom:'1rem', textAlign:'center' }}>
              {cameraError}
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'12px' }}>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize:'11px', color:'#4B5563', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:'500' }}>ou manuellement</span>
            <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="search-row" style={{ display:'flex', gap:'10px' }}>
            <input ref={inputRef} type="text" value={scannedCode} onChange={(e) => setScannedCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchCustomerByCode(scannedCode, business?.id)} placeholder="Collez le code QR ici..." className="input-scan" />
            <button onClick={() => searchCustomerByCode(scannedCode, business?.id)} disabled={loading || !scannedCode} className="btn-search">
              {loading ? '⏳' : '🔍 Chercher'}
            </button>
          </div>
        </div>

        {/* Fiche client */}
        {customer && (
          <div className="fade-up" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'24px', padding:'1.5rem', marginBottom:'1rem', animationDelay:'0s' }}>

            {/* Infos client */}
            <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem', paddingBottom:'1.25rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width:'56px', height:'56px', borderRadius:'50%', background:'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(236,72,153,0.15))', border:'2px solid rgba(245,158,11,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:'800', color:'#F59E0B', flexShrink:0, fontFamily:'Space Grotesk, sans-serif' }}>
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:'700', fontSize:'18px', marginBottom:'3px', fontFamily:'Space Grotesk, sans-serif' }}>{customer.first_name} {customer.last_name}</p>
                <p style={{ fontSize:'12px', color:'#6B7280' }}>
                  {customer.visits} visite{customer.visits > 1 ? 's' : ''} · Client fidèle 🌟
                </p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:'34px', fontWeight:'800', color:'#8B5CF6', lineHeight:1, fontFamily:'Space Grotesk, sans-serif' }}>{customer.loyalty_points}</p>
                <p style={{ fontSize:'12px', color:'#6B7280' }}>{loyaltyCard ? `/ ${loyaltyCard.points_required} pts` : 'points'}</p>
              </div>
            </div>

            {/* Barre de progression */}
            {loyaltyCard && (
              <div style={{ marginBottom:'1.5rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'8px' }}>
                  <span style={{ color:'#9CA3AF' }}>{customer.loyalty_points} / {loyaltyCard.points_required} points</span>
                  <span style={{ color:'#F59E0B', fontWeight:'500' }}>🎁 {loyaltyCard.reward}</span>
                </div>
                <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'100px', overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg, #8B5CF6, #F59E0B)', borderRadius:'100px', transition:'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
                {pct >= 80 && (
                  <p style={{ fontSize:'11px', color:'#F59E0B', marginTop:'6px', textAlign:'center' }}>
                    🔥 Presque là ! Plus que {loyaltyCard.points_required - customer.loyalty_points} point{loyaltyCard.points_required - customer.loyalty_points > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}

            {/* Sélecteur points */}
            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'16px', padding:'1.25rem', marginBottom:'1.25rem' }}>
              <p style={{ fontSize:'12px', color:'#9CA3AF', textAlign:'center', marginBottom:'1rem', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:'500' }}>Points à ajouter</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1.5rem' }}>
                <button className="pts-btn" onClick={() => setPointsToAdd(Math.max(1, pointsToAdd - 1))}>−</button>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'48px', fontWeight:'800', color:'#F0F0F5', lineHeight:1, fontFamily:'Space Grotesk, sans-serif' }}>{pointsToAdd}</div>
                  <div style={{ fontSize:'11px', color:'#6B7280', marginTop:'4px' }}>point{pointsToAdd > 1 ? 's' : ''}</div>
                </div>
                <button className="pts-btn" onClick={() => setPointsToAdd(pointsToAdd + 1)}>+</button>
              </div>
            </div>

            <button onClick={addPoints} disabled={loading} className="btn-add">
              {loading ? (
                <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                  <span style={{ width:'18px', height:'18px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 1s linear infinite', display:'inline-block' }} />
                  En cours...
                </span>
              ) : `⚡ Ajouter ${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''} à ${customer.first_name}`}
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className="fade-up" style={{ borderRadius:'16px', padding:'1rem 1.25rem', fontSize:'14px', fontWeight:'500', textAlign:'center', background: messageType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border:`1px solid ${messageType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: messageType === 'error' ? '#F87171' : '#10B981' }}>
            {message}
          </div>
        )}

        {!loyaltyCard && (
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'16px', padding:'1rem', fontSize:'13px', color:'#F59E0B', textAlign:'center' }}>
            Pas de carte fidélité configurée.{' '}
            <span onClick={() => router.push('/cards')} style={{ textDecoration:'underline', cursor:'pointer', fontWeight:'600' }}>Créer ma carte →</span>
          </div>
        )}
      </div>
    </div>
  )
}