'use client'

import { useState } from 'react'
import { HardHat, Check, X, Info } from 'lucide-react'
import { saveConcreteAttendance } from './concreteActions'

export default function ConcreteManager({ 
  workers, 
  attendanceRecords, 
  planId, 
  date 
}: { 
  workers: any[], 
  attendanceRecords: any[],
  planId: string,
  date: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [concreteWage, setConcreteWage] = useState(250) // Varsayılan
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>(
    attendanceRecords.filter(a => a.is_concrete).map(a => a.worker_id)
  )
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('plan_id', planId)
    formData.append('date', date)
    formData.append('concrete_wage', concreteWage.toString())
    formData.append('selected_workers', JSON.stringify(selectedWorkers))

    await saveConcreteAttendance(formData)
    setLoading(false)
    setIsOpen(false)
  }

  const toggleWorker = (id: string) => {
    setSelectedWorkers(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  const concreteCount = selectedWorkers.length

  return (
    <div className="relative">
      {/* Beton Kartı (Küçültülmüş Görünüm) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-5 rounded-[2rem] border-2 transition-all transform active:scale-[0.98] flex items-center justify-between shadow-lg ${
          concreteCount > 0 
          ? 'bg-orange-600 border-orange-400 text-white shadow-orange-600/20' 
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${concreteCount > 0 ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <HardHat size={24} className={concreteCount > 0 ? 'text-white' : 'text-gray-400'} />
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-black uppercase tracking-tight ${concreteCount > 0 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Beton Mesaisi</h3>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest leading-none">
              {concreteCount > 0 ? `${concreteCount} İşçi Betona Kaldı` : 'Döküm varsa tıkla'}
            </p>
          </div>
        </div>
        {concreteCount > 0 && (
          <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-black">
            +₺{concreteWage}
          </div>
        )}
      </button>

      {/* Seçim Paneli (Modal Benzeri) */}
      {isOpen && (
        <div className="mt-4 bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border-4 border-orange-500 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 z-20 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase">Beton Ekibini Seç</h4>
              <p className="text-sm font-bold text-gray-400">Bugün betona kimler kaldı?</p>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl w-full sm:w-auto">
              <span className="text-xs font-black text-gray-400 uppercase">Beton Ücreti:</span>
              <div className="flex items-center gap-2">
                <span className="font-black text-orange-600">₺</span>
                <input 
                  type="number"
                  value={concreteWage}
                  onChange={(e) => setConcreteWage(parseFloat(e.target.value))}
                  className="bg-transparent border-none outline-none font-black text-xl text-gray-900 dark:text-white w-24"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {workers.map(worker => {
              const isSelected = selectedWorkers.includes(worker.user_id)
              return (
                <button
                  key={worker.user_id}
                  onClick={() => toggleWorker(worker.user_id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    isSelected 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' 
                    : 'border-gray-100 dark:border-gray-700 hover:border-orange-200'
                  }`}
                >
                  <span className={`font-bold ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {worker.full_name}
                  </span>
                  {isSelected && <Check className="text-orange-600" size={20} />}
                </button>
              )
            })}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'KAYDEDİLİYOR...' : 'BETON KAYDINI TAMAMLA'}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="px-8 bg-gray-100 dark:bg-gray-700 text-gray-500 font-black rounded-2xl hover:bg-gray-200 transition-all"
            >
              İPTAL
            </button>
          </div>
          
          <div className="mt-4 flex items-start gap-2 text-[10px] font-bold text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl uppercase">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>Not: Sadece yoklaması "Tam Gün" veya "Yarım Gün" olan işçilere beton ücreti yansıtılır.</span>
          </div>
        </div>
      )}
    </div>
  )
}
