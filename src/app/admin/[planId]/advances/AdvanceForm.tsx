'use client'

import { useState } from 'react'
import { Banknote, X, AlertCircle } from 'lucide-react'
import { addAdvance } from './actions'

export default function AdvanceForm({ planId, workers, today }: { planId: string, workers: any[], today: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const selectedDate = formData.get('date') as string
      if (selectedDate > today) {
        throw new Error('Gelecek bir tarih için avans girişi yapılamaz.')
      }

      await addAdvance(formData)
      // Formu temizle
      ;(e.target as HTMLFormElement).reset()
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-8 border-red-600 p-6 rounded-3xl animate-in slide-in-from-top duration-300 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded-full text-white">
              <AlertCircle size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-red-900 font-black uppercase text-sm tracking-widest">Hata: Geçersiz Tarih</p>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-2xl font-black mb-8 text-gray-900 dark:text-white flex items-center gap-3">
          <div className="bg-red-600 p-2 rounded-xl text-white">
            <Banknote size={20} />
          </div>
          Yeni Avans Ekle
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <input type="hidden" name="plan_id" value={planId} />
          
          <div className="md:col-span-5 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşçi Seçin</label>
            <select name="worker_id" required className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-transparent rounded-2xl focus:border-red-600 outline-none transition-all text-lg font-bold cursor-pointer appearance-none shadow-sm">
              <option value="">İşçi Seçiniz...</option>
              {workers?.map(w => (
                <option key={w.user_id} value={w.user_id}>
                  {w.full_name} (@{(w as any).profiles?.username})
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-3 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Miktar (₺)</label>
            <input name="amount" type="number" required placeholder="0.00" className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-transparent rounded-2xl placeholder:text-gray-400 focus:border-red-600 outline-none transition-all text-lg font-bold shadow-sm" />
          </div>

          <div className="md:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tarih</label>
            <input name="date" type="date" defaultValue={today} required className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-transparent rounded-2xl focus:border-red-600 outline-none transition-all text-lg font-bold shadow-sm" />
          </div>

          <div className="md:col-span-9 space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Açıklama</label>
            <input name="description" placeholder="Örn: Haftalık avans, Nakit ödeme vb." className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-transparent rounded-2xl placeholder:text-gray-400 focus:border-red-600 outline-none transition-all text-lg font-bold shadow-sm" />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-red-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'KAYDEDİLİYOR...' : 'Avansı Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
