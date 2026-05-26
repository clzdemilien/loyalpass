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
  const [form, setForm] = useState({
    name: '',
    points_required: 10,
    reward: '',
  })
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

      const { data: existingCard } = await supabase
        .from('loyalty_cards')
        .select('*')
        .eq('business_id', biz.id)
        .single()

      if (existingCard) {
        setCard(existingCard)
        setForm({
          name: existingCard.name,
          points_required: existingCard.points_required,
          reward: existingCard.reward,
        })
      }
      setLoading(false)
    }
    getData()
  }, [])

  const saveCard = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    if (card) {
      await supabase
        .from('loyalty_cards')
        .update(form)
        .eq('id', card.id)
    } else {
      const { data } = await supabase
        .from('loyalty_cards')
        .insert({ ...form, business_id: business.id })
        .select()
        .single()
      setCard(data)
    }

    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  )

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
          <h2 className="text-xl font-semibold mb-1">Ma carte fidélité</h2>
          <p className="text-sm text-gray-400">Définissez les règles de votre programme de fidélité</p>
        </div>

        <form onSubmit={saveCard} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="mb-5">
            <label className="text-sm text-gray-600 mb-1 block font-medium">Nom de la carte</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Ex : Carte fidélité Boulangerie"
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="mb-5">
            <label className="text-sm text-gray-600 mb-1 block font-medium">Nombre de points pour la récompense</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="50"
                value={form.points_required}
                onChange={(e) => setForm({...form, points_required: parseInt(e.target.value)})}
                className="flex-1 accent-purple-600"
              />
              <span className="w-12 text-center font-semibold text-purple-600 text-lg">{form.points_required}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Le client reçoit une récompense après {form.points_required} visite{form.points_required > 1 ? 's' : ''}</p>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-1 block font-medium">Récompense</label>
            <input
              type="text"
              value={form.reward}
              onChange={(e) => setForm({...form, reward: e.target.value})}
              placeholder="Ex : 1 café offert, -15% sur la commande..."
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : card ? 'Mettre à jour' : 'Créer ma carte'}
          </button>

          {saved && (
            <p className="text-center text-green-600 text-sm mt-3">✓ Carte enregistrée avec succès !</p>
          )}
        </form>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium mb-4 text-sm text-gray-500">Aperçu de la carte</h3>
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: business?.primary_color || '#7B5CFF' }}
          >
            <p className="font-semibold text-lg mb-1">{business?.name}</p>
            <p className="text-sm opacity-75 mb-4">{form.name || 'Nom de la carte'}</p>
            <div className="flex gap-2 mb-4">
              {Array.from({ length: Math.min(form.points_required, 10) }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white border-opacity-50"
                />
              ))}
              {form.points_required > 10 && (
                <span className="text-xs opacity-60 self-center">+{form.points_required - 10}</span>
              )}
            </div>
            <p className="text-xs opacity-60">Récompense : {form.reward || 'à définir'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}