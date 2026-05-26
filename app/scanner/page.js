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
  const [pointsToAdd, setPointsToAdd] = useState(1)
  const [loyaltyCard, setLoyaltyCard] = useState(null)
  const inputRef = useRef(null)
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

      const { data: card } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('business_id', biz.id)
        .single()
      setLoyaltyCard(card)
    }
    getData()
  }, [])

  const searchCustomer = async (qrCode) => {
    if (!qrCode.trim()) return
    setLoading(true)
    setCustomer(null)
    setMessage('')

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('qr_code', qrCode.trim())
      .eq('business_id', business.id)
      .single()

    if (error || !data) {
      setMessage('Client introuvable')
      setMessageType('error')
    } else {
      setCustomer(data)
    }
    setLoading(false)
  }

  const addPoints = async () => {
    if (!customer) return
    setLoading(true)

    const newPoints = customer.loyalty_points + pointsToAdd
    const newVisits = customer.visits + 1

    await supabase
      .from('customers')
      .update({
        loyalty_points: newPoints,
        visits: newVisits,
        last_visit: new Date().toISOString(),
      })
      .eq('id', customer.id)

    await supabase
      .from('transactions')
      .insert({
        customer_id: customer.id,
        business_id: business.id,
        points_added: pointsToAdd,
      })

    const rewardReached = loyaltyCard && newPoints >= loyaltyCard.points_required

    if (rewardReached) {
      await supabase
        .from('rewards')
        .insert({
          customer_id: customer.id,
          business_id: business.id,
          reward_text: loyaltyCard.reward,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })

      await supabase
        .from('customers')
        .update({ loyalty_points: 0 })
        .eq('id', customer.id)

      setMessage(`🎉 Récompense débloquée ! ${loyaltyCard.reward}`)
      setMessageType('reward')
    } else {
      setMessage(`✓ +${pointsToAdd} point${pointsToAdd > 1 ? 's' : ''} ajouté${pointsToAdd > 1 ? 's' : ''} à ${customer.first_name}`)
      setMessageType('success')
    }

    setCustomer({ ...customer, loyalty_points: rewardReached ? 0 : newPoints, visits: newVisits })
    setScannedCode('')
    setLoading(false)
    if (inputRef.current) inputRef.current.focus()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-600 text-sm">← Retour</button>
          <h1 className="text-lg font-semibold">Loyal<span className="text-purple-600">Pass</span></h1>
        </div>
        <span className="text-sm text-gray-500">{business?.name}</span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">Scanner un client</h2>
          <p className="text-sm text-gray-400">Entrez le code QR ou scannez avec un lecteur</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <label className="text-sm text-gray-600 mb-2 block font-medium">Code QR client</label>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomer(scannedCode)}
              placeholder="Scannez ou collez le code..."
              autoFocus
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 font-mono"
            />
            <button
              onClick={() => searchCustomer(scannedCode)}
              disabled={loading}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              Rechercher
            </button>
          </div>
        </div>

        {customer && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg">
                {customer.first_name?.[0]}{customer.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold">{customer.first_name} {customer.last_name}</p>
                <p className="text-sm text-gray-400">{customer.visits} visite{customer.visits > 1 ? 's' : ''}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-semibold text-purple-600">{customer.loyalty_points}</p>
                <p className="text-xs text-gray-400">
                  {loyaltyCard ? `/ ${loyaltyCard.points_required} pts` : 'points'}
                </p>
              </div>
            </div>

            {loyaltyCard && (
              <div className="mb-5">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{customer.loyalty_points} pts</span>
                  <span>Objectif : {loyaltyCard.points_required} pts → {loyaltyCard.reward}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${Math.min((customer.loyalty_points / loyaltyCard.points_required) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Points à ajouter :</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setPointsToAdd(Math.max(1, pointsToAdd - 1))}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg"
                >−</button>
                <span className="px-4 py-2 font-medium text-sm">{pointsToAdd}</span>
                <button
                  onClick={() => setPointsToAdd(pointsToAdd + 1)}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition text-lg"
                >+</button>
              </div>
              <button
                onClick={addPoints}
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'En cours...' : 'Ajouter les points'}
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`rounded-xl p-4 text-sm font-medium text-center ${
            messageType === 'reward'
              ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              : messageType === 'error'
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {!loyaltyCard && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-orange-600 text-center">
            Vous n'avez pas encore créé de carte fidélité.{' '}
            <span
              onClick={() => router.push('/cards')}
              className="underline cursor-pointer"
            >
              Créer ma carte
            </span>
          </div>
        )}
      </div>
    </div>
  )
}