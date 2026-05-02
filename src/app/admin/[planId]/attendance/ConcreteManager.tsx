'use client'

import { useState } from 'react'
import { saveConcreteAttendance } from './concreteActions'
import { HardHat, Check, Loader2 } from 'lucide-react'

interface Worker {
  user_id: string
  full_name: string
}

export default function ConcreteManager({ 
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
      await saveConcreteAttendance(planId, selectedWorkers, bonus, date)
    } finally {
      setLoading(false)
    }
  }

  const isActive = selectedWorkers.length > 0

  return (
    <div className={`
      relative overflow-hidden p-5 rounded-[2rem] border-2 transition-all duration-500
      ${isActive 
        ? 'bg-orange-600 border-orange-400 shadow-xl shadow-orange-600/20' 
        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}
    `}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isActive ? 'bg-white text-orange-600' : 'bg-orange-50 text-orange-600'}`}>
            <HardHat size={20} strokeWidth={3} />
          </div>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              Beton Mesaİsİ
            </h3>
            <p className={`text-[10px] font-bold ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>
              {selectedWorkers.length} İşçi Seçildi
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black ${isActive ? 'text-orange-100' : 'text-gray-400'}`}>₺</span>
          <input 
            type="number" 
            value={bonus}
            onChange={(e) => setBonus(Number(e.target.value))}
            className={`w-20 min-h-[44px] px-3 py-1 rounded-lg text-sm font-black outline-none transition-all
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
                min-h-[44px] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all flex items-center gap-1
                ${isSel 
                  ? 'bg-white text-orange-600 shadow-lg' 
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-400 hover:text-orange-600'}
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
          w-full min-h-[44px] py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2
          ${isActive 
            ? 'bg-white text-orange-600 hover:bg-orange-50' 
            : 'bg-orange-600 text-white hover:bg-orange-700'}
          disabled:opacity-50
        `}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : 'KAYDET'}
      </button>
    </div>
  )
}
