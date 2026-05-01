'use client'

import { useState } from 'react'
import { saveAksAttendance } from './aksActions'
import { Ruler, Check, Loader2 } from 'lucide-react'

interface Worker {
  user_id: string
  full_name: string
}

export default function AksManager({ 
  planId, 
  workers, 
  date,
  initialSelected,
  initialBonus = 500
}: { 
  planId: string, 
  workers: Worker[], 
  date: string,
  initialSelected: string[],
  initialBonus?: number
}) {
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(initialSelected)
  const [bonus, setBonus] = useState(initialBonus)
  const [loading, setLoading] = useState(false)

  const toggleWorker = (id: string) => {
    setSelectedWorkers(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await saveAksAttendance(planId, selectedWorkers, bonus, date)
    } finally {
      setLoading(false)
    }
  }

  const isActive = selectedWorkers.length > 0

  return (
    <div className={`
      relative overflow-hidden p-5 rounded-[2rem] border-2 transition-all duration-500
      ${isActive 
        ? 'bg-blue-600 border-blue-400 shadow-xl shadow-blue-600/20' 
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
            <Ruler size={20} strokeWidth={3} />
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              Aks Mesaİsİ
            </h3>
            <p className={`text-[10px] font-bold ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>
              {selectedWorkers.length} İşçi Seçildi
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>₺</span>
          <input 
            type="number" 
            value={bonus}
            onChange={(e) => setBonus(Number(e.target.value))}
            className={`w-16 px-2 py-1 rounded-lg text-sm font-black outline-none transition-all
              ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}
            `}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
        {workers.map(w => {
          const isSel = selectedWorkers.includes(w.user_id)
          return (
            <button
              key={w.user_id}
              onClick={() => toggleWorker(w.user_id)}
              className={`
                px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1
                ${isSel 
                  ? 'bg-white text-blue-600 shadow-lg' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-blue-600'}
              `}
            >
              {isSel && <Check size={10} strokeWidth={4} />}
              {w.full_name.split(' ')[0]}
            </button>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className={`
          w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2
          ${isActive 
            ? 'bg-white text-blue-600 hover:bg-blue-50' 
            : 'bg-blue-600 text-white hover:bg-blue-700'}
          disabled:opacity-50
        `}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'KAYDET'}
      </button>
    </div>
  )
}
