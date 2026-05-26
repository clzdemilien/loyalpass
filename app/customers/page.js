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

      const { data: custs } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', biz.id)
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
      .from('customers')
      .insert({
        ...form,
        business_id: business.id,
      })
      .select()
      .single()

    if (!error) {
      setCustomers([data, ...customers])
      setForm({ first_name: '', last_name: '', email: '', phone: '' })
      setShowForm(false)
    }
    setSaving(false)
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

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Mes clients</h2>
            <p className="text-sm text-gray-500">{customers.length} client{customers.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
          >
            + Ajouter un client
          </button>
        </div>

        {showForm && (
          <form onSubmit={addCustomer} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-medium mb-4">Nouveau client</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Prénom</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => setForm({...form, first_name: e.target.value})}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Nom</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => setForm({...form, last_name: e.target.value})}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500 px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">Aucun client pour l'instant</p>
            <p className="text-gray-400 text-sm">Ajoutez votre premier client en cliquant sur le bouton ci-dessus</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {customers.map((c, i) => (
              <div
                key={c.id}
                onClick={() => router.push(`/customers/${c.id}`)}
                className={`flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition ${i < customers.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-gray-400">{c.email || c.phone || 'Pas de contact'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-600">{c.loyalty_points} pts</p>
                  <p className="text-xs text-gray-400">{c.visits} visite{c.visits > 1 ? 's' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}