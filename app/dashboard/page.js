'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setBusiness(data)
      setLoading(false)
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Loyal<span className="text-purple-600">Pass</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{business?.name}</span>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 transition">
            Déconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-1">Bonjour 👋</h2>
          <p className="text-gray-500">Bienvenue sur votre tableau de bord — <span className="font-medium text-gray-700">{business?.name}</span></p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Clients actifs', value: '0' },
            { label: 'Scans ce mois', value: '0' },
            { label: 'Récompenses offertes', value: '0' },
            { label: 'Taux de retour', value: '0%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Scanner un client', desc: 'Ajoutez des points en scannant le QR code', icon: '📷', href: '/scanner' },
            { label: 'Mes clients', desc: 'Gérez votre liste de clients fidèles', icon: '👥', href: '/customers' },
            { label: 'Ma carte fidélité', desc: 'Personnalisez votre carte', icon: '🎴', href: '/cards' },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-purple-300 transition"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-medium mb-1">{item.label}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}