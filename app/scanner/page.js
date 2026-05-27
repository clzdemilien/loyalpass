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
  const scannerRef = useRef(null)
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
      if (code) {
        setScannedCode(code)
        setTimeout(() => searchCustomerByCode(code, biz.id), 500)
      }
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
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            setScannedCode(decodedText)
            stopCamera()
            searchCustomerByCode(decodedText, business?.id)
          },
          () => {}
        )
      } catch (err) {
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
    setLoading(true)
    setCustomer(null)
    setMessage('')
    const { data, error } = await supabase
      .from('customers').select('*')
      .eq('qr_code', code.trim())
      .eq('business_id', bizId || business?.id)
      .single()
    if (error || !data) { setMessage('Client introuvable'); setMessageType('error') }
    else setCustomer(data)
    setLoading(false)
  }

  const searchCustomer = () => searchCustomerByCode(scannedCode, business?.id)

  const addPoints = async () => {
    if (!customer) return
    setLoading(true)
    const newPoints = customer.loyalty_points + pointsToAdd
    const newVisits = customer.visits + 1
    await supabase.from('customers').update({
      loyalty_points: newPoints, visits: newVisits, last_visit: new Date().toISOString()
    }).eq('id', customer.id)
    await supabase.from('transactions').insert({
      customer_id: customer.id, business_id: business.id, points_added: pointsToAdd
    })
    const rewardReached = loyaltyCard && newPoints >= loyaltyCard.points_required
    if (rewardReached) {
      await supabase.from('rewards').insert({
        customer_id: customer.id, business_id: business.id,
        reward_text: loyaltyCard.reward,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      await supabase.from('customers').update({ loyalty_points: 0 }).eq('id', customer.id)
      setRewardText(loyaltyCard.reward)
      setShowFireworks(true)
      setCustomer({ ...customer, loyalty_points: 0, visits: newVisits })
      setTimeout(() => setShowFireworks(false), 5000)
    } else {
      setMessage(`✓ +${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''} ajouté${pointsToAdd > 1 ? 's' : ''} à ${customer.first_name}`)
      setMessageType('success')
      setCustomer({ ...customer, loyalty_points: newPoints, visits: newVisits })
    }
    setScannedCode('')
    setLoading(false)
    if (inputRef.current) inputRef.current.focus()
  }

  const pct = loyaltyCard && customer ? Math.min((customer.loyalty_points / loyaltyCard.points_required) * 100, 100) : 0

  const particles = Array.from({ length: 60 }, (_, i) => ({
    color: ['#8B5CF6','#06B6D4','#F59E0B','#EC4899','#10B981','#fff','#F87171','#A78BFA'][i % 8],
    x: `${(Math.random() - 0.5) * 600}px`,
    y: `${(Math.random() - 0.5) * 600}px`,
    delay: `${Math.random() * 1}s`,
    duration: `${0.8 + Math.random() * 1}s`,
    left: `${20 + Math.random() * 60}%`,
    top: `${20 + Math.random() * 60}%`,
    size: `${4 + Math.random() * 8}px`,
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', color: '#F0F0F5', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .input-scan { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px 18px; color: #F0F0F5; font-size: 14px; font-family: monospace; outline: none; transition: border-color 0.2s; }
        .input-scan:focus { border-color: rgba(139,92,246,0.6); background: rgba(139,92,246,0.03); }
        .input-scan::placeholder { color: #4B5563; font-family: inherit; }
        .btn-search { background: linear-gradient(135deg, #8B5CF6, #6D28D9); border: none; border-radius: 14px; padding: 14px 20px; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s; white-space: nowrap; }
        .btn-search:hover { opacity: 0.85; }
        .btn-search:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-camera { background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.3); border-radius: 14px; padding: 14px 20px; color: #06B6D4; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; margin-bottom: 1rem; }
        .btn-camera:hover { background: rgba(6,182,212,0.2); }
        .btn-stop { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); border-radius: 14px; padding: 14px 20px; color: #F87171; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; width: 100%; margin-bottom: 1rem; }
        .btn-stop:hover { background: rgba(239,68,68,0.2); }
        .btn-add { width: 100%; background: linear-gradient(135deg, #8B5CF6, #6D28D9); border: none; border-radius: 14px; padding: 14px; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; font-family: inherit; transition: opacity 0.2s, transform 0.2s; }
        .btn-add:hover { opacity: 0.85; transform: translateY(-1px); }
        .btn-add:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
        .pts-btn { width: 40px; height: 40px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #F0F0F5; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; font-family: inherit; }
        .pts-btn:hover { background: rgba(255,255,255,0.12); }
        #qr-reader { width: 100%; border-radius: 16px; overflow: hidden; }
        #qr-reader video { border-radius: 16px; width: 100% !important; }
        #qr-reader img { display: none !important; }
        @keyframes particle-fly { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        .particle { position: absolute; border-radius: 50%; animation: particle-fly var(--dur) ease-out var(--delay) forwards; }
        @keyframes reward-pop { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        .reward-card { animation: reward-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes shine { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .shine-text { background: linear-gradient(90deg, #8B5CF6, #06B6D4, #F59E0B, #EC4899, #8B5CF6); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shine 3s linear infinite; }
      `}</style>

      {/* Feux d'artifice */}
      {showFireworks && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setShowFireworks(false)}>
          {particles.map((p, i) => (
            <div key={i} className="particle" style={{
              width: p.size, height: p.size, background: p.color,
              left: p.left, top: p.top,
              '--tx': p.x, '--ty': p.y,
              '--dur': p.duration, '--delay': p.delay,
            }} />
          ))}
          <div className="reward-card" style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(139,92,246,0.5)', borderRadius: '28px', padding: '3rem 3.5rem', textAlign: 'center', zIndex: 1000, maxWidth: '380px', boxShadow: '0 0 80px rgba(139,92,246,0.3)' }}>
            <div style={{ fontSize: '56px', marginBottom: '1rem' }}>🎉</div>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }} className="shine-text">Récompense débloquée !</div>
            <div style={{ fontSize: '18px', color: '#A78BFA', fontWeight: '600', marginBottom: '1.25rem' }}>{rewardText}</div>
            <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Merci pour votre fidélité, c'est un plaisir de vous avoir parmi nos clients ! ✨
            </div>
            <div style={{ fontSize: '12px', color: '#4B5563' }}>Appuyez pour fermer</div>
          </div>
        </div>
      )}

      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => { stopCamera(); router.push('/dashboard') }} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: '18px' }}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>L</div>
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Loyal<span style={{ color: '#8B5CF6' }}>Pass</span></span>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#6B7280' }}>{business?.name}</span>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>Scanner un client</h1>
          <p style={{ color: '#6B7280', fontSize: '13px' }}>Utilisez la caméra ou entrez le code manuellement</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem' }}>
          <label style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '500' }}>Scanner le QR code</label>

          <button onClick={cameraOpen ? stopCamera : startCamera} className={cameraOpen ? 'btn-stop' : 'btn-camera'}>
            {cameraOpen ? '⏹ Fermer la caméra' : '📷 Ouvrir la caméra'}
          </button>

          {cameraOpen && (
            <div style={{ marginBottom: '1rem', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
              <div id="qr-reader" ref={scannerRef} />
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '24px', height: '24px', borderTop: '3px solid #06B6D4', borderLeft: '3px solid #06B6D4', borderRadius: '4px 0 0 0' }} />
                  <div style={{ position: 'absolute', top: 0, right: 0, width: '24px', height: '24px', borderTop: '3px solid #06B6D4', borderRight: '3px solid #06B6D4', borderRadius: '0 4px 0 0' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, width: '24px', height: '24px', borderBottom: '3px solid #06B6D4', borderLeft: '3px solid #06B6D4', borderRadius: '0 0 0 4px' }} />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderBottom: '3px solid #06B6D4', borderRight: '3px solid #06B6D4', borderRadius: '0 0 4px 0' }} />
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px', fontSize: '13px', color: '#F87171', marginBottom: '1rem', textAlign: 'center' }}>
              {cameraError}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: '11px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ou manuellement</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input ref={inputRef} type="text" value={scannedCode} onChange={(e) => setScannedCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchCustomer()} placeholder="Collez le code ici..." className="input-scan" />
            <button onClick={searchCustomer} disabled={loading || !scannedCode} className="btn-search">
              {loading ? '...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {customer && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(109,40,217,0.2))', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#A78BFA', flexShrink: 0 }}>
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '3px' }}>{customer.first_name} {customer.last_name}</p>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>{customer.visits} visite{customer.visits > 1 ? 's' : ''}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#8B5CF6', lineHeight: 1 }}>{customer.loyalty_points}</p>
                <p style={{ fontSize: '12px', color: '#6B7280' }}>{loyaltyCard ? `/ ${loyaltyCard.points_required} pts` : 'points'}</p>
              </div>
            </div>

            {loyaltyCard && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                  <span>{customer.loyalty_points} pts</span>
                  <span>🎁 {loyaltyCard.reward}</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)', borderRadius: '100px', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '13px', color: '#9CA3AF', flexShrink: 0 }}>Points à ajouter</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="pts-btn" onClick={() => setPointsToAdd(Math.max(1, pointsToAdd - 1))}>−</button>
                <span style={{ fontSize: '18px', fontWeight: '700', minWidth: '28px', textAlign: 'center' }}>{pointsToAdd}</span>
                <button className="pts-btn" onClick={() => setPointsToAdd(pointsToAdd + 1)}>+</button>
              </div>
            </div>

            <button onClick={addPoints} disabled={loading} className="btn-add">
              {loading ? 'En cours...' : `⚡ Ajouter ${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {message && (
          <div style={{
            borderRadius: '16px', padding: '1rem 1.25rem', fontSize: '14px', fontWeight: '500', textAlign: 'center',
            background: messageType === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${messageType === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
            color: messageType === 'error' ? '#F87171' : '#10B981'
          }}>
            {message}
          </div>
        )}

        {!loyaltyCard && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '16px', padding: '1rem 1.25rem', fontSize: '13px', color: '#F59E0B', textAlign: 'center' }}>
            Pas de carte fidélité configurée.{' '}
            <span onClick={() => router.push('/cards')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Créer ma carte</span>
          </div>
        )}
      </div>
    </div>
  )
}