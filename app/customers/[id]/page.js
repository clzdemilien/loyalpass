'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'

export default function CustomerDetail({ params }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('id', params.id)
        .single()
      setCustomer(data)
      setLoading(false)
    }
    getData()
  }, [params.id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Chargement...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/customers')} className="text-gray-400 hover:text-gray-600 text-sm">← Retour</button>
          <h1 className="text-lg font-semibold">Loyal<span className="text-purple-600">Pass</span></h1>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
              {customer?.first_name?.[0]}{customer?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{customer?.first_name} {customer?.last_name}</h2>
              <p className="text-sm text-gray-400">{customer?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold text-purple-600">{customer?.loyalty_points}</p>
              <p className="text-xs text-gray-400 mt-1">Points</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold">{customer?.visits}</p>
              <p className="text-xs text-gray-400 mt-1">Visites</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold">0</p>
              <p className="text-xs text-gray-400 mt-1">Récompenses</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <h3 className="font-medium mb-2">QR Code client</h3>
          <p className="text-sm text-gray-400 mb-6">Scannez ce code pour ajouter des points</p>
          <div className="flex justify-center mb-6">
            <QRCodeCanvas
              value={customer?.qr_code || ''}
              size={200}
              level="H"
            />
          </div>
          <button
  onClick={() => {
    const el = document.createElement('textarea')
    el.value = customer?.qr_code
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    alert('Code copié !')
  }}
  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition"
>
  Copier le code QR
          </button>
        </div>
      </div>
    </div>
  )
}