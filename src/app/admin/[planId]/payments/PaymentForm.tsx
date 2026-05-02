'use client'

import { useState } from 'react'
import { makePayment } from './actions'
import { Loader2, Banknote, AlertCircle } from 'lucide-react'

interface WorkerBalance {
  id: string
  name: string
  username: string
  earned: number
  advanced: number
  balance: number
}

export default function PaymentForm({ 
  planId, 
  workers 
}: { 
  planId: string
  workers: WorkerBalance[] 
}) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedWorker = workers.find(w => w.id === selectedWorkerId)
  
  const eligibleWorkers = workers.filter(w => w.balance > 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWorkerId || amount === '' || amount <= 0) return
    
    if (selectedWorker && amount > selectedWorker.balance) {
      setError(`Ödeme tutarı, işçinin net alacağından (₺${selectedWorker.balance.toLocaleString('tr-TR')}) fazla olamaz.`)
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('plan_id', planId)
    formData.append('worker_id', selectedWorkerId)
    formData.append('amount', amount.toString())
    formData.append('max_amount', selectedWorker?.balance.toString() || '0')

    try {
      await makePayment(formData)
      setSuccess(`${selectedWorker?.name} adlı işçiye ₺${amount.toLocaleString('tr-TR')} ödeme yapıldı.`)
      setAmount('')
      setSelectedWorkerId('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ödeme sırasında bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (eligibleWorkers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border-2 border-indigo-50 dark:border-gray-700 text-center">
        <p className="text-gray-500 font-medium">Şu an içeride alacağı olan bir işçi bulunmuyor.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border-2 border-indigo-100 dark:border-indigo-900/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
          <Banknote size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">Maaş / Toplu Ödeme Yap</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">İşçi Seç ve Öde</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm font-bold">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-start gap-3 text-sm font-bold">
            <Banknote size={20} className="shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">İşçi Seç</label>
          <select
            value={selectedWorkerId}
            onChange={(e) => {
              setSelectedWorkerId(e.target.value)
              setError('')
              setSuccess('')
            }}
            required
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-lg rounded-2xl px-4 py-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold appearance-none"
          >
            <option value="" disabled>-- İşçi Seçin --</option>
            {eligibleWorkers.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} (Alacak: ₺{w.balance.toLocaleString('tr-TR')})
              </option>
            ))}
          </select>
        </div>

        {selectedWorker && (
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Ödenecek Tutar (₺)</label>
              <span className="text-xs font-bold text-indigo-600">Maks: ₺{selectedWorker.balance.toLocaleString('tr-TR')}</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₺</span>
              <input
                type="number"
                min="1"
                max={selectedWorker.balance}
                required
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value === '' ? '' : Number(e.target.value))
                  setError('')
                }}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-xl font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Örn: 5000"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setAmount(selectedWorker.balance)}
                className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Tümünü Öde
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedWorkerId || amount === '' || amount <= 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'ÖDEMEYİ TAMAMLA'}
        </button>
      </form>
    </div>
  )
}
