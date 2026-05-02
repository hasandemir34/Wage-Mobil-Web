'use client'

import { useState, useEffect } from 'react'
import { Check, Calendar, Users, Zap, X } from 'lucide-react'
import { saveAttendance } from './actions'

interface Worker {
  user_id: string
  full_name: string
  base_daily_wage: number
}

interface AttendanceRecord {
  worker_id: string
  status: string
}

export default function AttendanceManager({ 
  workers, 
  initialAttendance, 
  planId, 
  currentDate 
}: { 
  workers: Worker[], 
  initialAttendance: AttendanceRecord[], 
  planId: string,
  currentDate: string 
}) {
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    workers.forEach(w => {
      const record = initialAttendance.find(a => a.worker_id === w.user_id)
      initial[w.user_id] = record?.status || 'absent'
    })
    return initial
  })
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = async (workerId: string, status: string) => {
    try {
      // Türkiye saatine göre bugünün tarihini al (YYYY-MM-DD)
      const turkeyTodayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
      
      if (currentDate > turkeyTodayStr) {
        setError('Gelecek bir tarih için kayıt girişi yapılamaz.')
        setTimeout(() => setError(null), 5000)
        return
      }

      setAttendance(prev => ({ ...prev, [workerId]: status }))
      setSaving(workerId)
      setError(null)
      
      const formData = new FormData()
      formData.append('plan_id', planId)
      formData.append('worker_id', workerId)
      formData.append('date', currentDate)
      formData.append('status', status)
      formData.append('overtime_hours', '0') // Basitleştirme için

      await saveAttendance(formData)
      
      setSaving(null)
      setSaved(workerId)
      setTimeout(() => setSaved(null), 2000)
    } catch (err: any) {
      setSaving(null)
      setError(err.message || 'Kayıt sırasında bir hata oluştu.')
      // 5 saniye sonra hatayı temizle
      setTimeout(() => setError(null), 5000)
    }
  }

  const markAllFullDay = async () => {
    const promises = workers.map(async (worker) => {
      if (attendance[worker.user_id] !== 'present') {
        return handleStatusChange(worker.user_id, 'present')
      }
    })
    await Promise.all(promises)
  }

  return (
    <div className="space-y-8">
      {/* Hata Mesajı Uyarı Kutusu */}
      {error && (
        <div className="bg-red-50 border-l-8 border-red-600 p-6 rounded-3xl animate-in slide-in-from-top duration-300 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-red-600 p-2 rounded-full text-white">
              <X size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-red-900 font-black uppercase text-sm tracking-widest">Dİkkat! İşlem Engellendi</p>
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Üst Bar: Tarih ve Toplu İşlem */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Seçili Tarih</p>
            <input 
              type="date" 
              value={currentDate}
              onChange={(e) => window.location.href = `?date=${e.target.value}`}
              className="text-xl font-black text-gray-900 dark:text-white bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        <button 
          onClick={markAllFullDay}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Zap size={20} />
          TÜMÜNÜ TAM GÜN İŞARETLE
        </button>
      </div>

      {/* İşçi Listesi */}
      <div className="grid gap-4">
        {workers.map((worker) => {
          const isAbsent = attendance[worker.user_id] === 'absent'
          return (
          <div key={worker.user_id} className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-all ${
            isAbsent
              ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
          }`}>
            <div className="flex items-center gap-3 self-start sm:self-center">
              <div className={`p-3 sm:p-4 rounded-2xl shrink-0 ${isAbsent ? 'bg-red-100 dark:bg-red-900/40 text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <h4 className={`text-base sm:text-xl font-black truncate ${isAbsent ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-white'}`}>
                  {worker.full_name}
                </h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span className="text-[10px] sm:text-sm font-bold text-gray-400 uppercase">@{(worker as any).profiles?.username}</span>
                  <span className="hidden sm:inline text-gray-300 mx-1">•</span>
                  <span className="text-[10px] sm:text-sm font-bold text-indigo-600 uppercase">₺{worker.base_daily_wage} Yevmİye</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {[
                { id: 'present', label: 'TAM GÜN', activeColor: 'bg-green-600 text-white border-green-600' },
                { id: 'absent', label: 'GELMEDİ', activeColor: 'bg-red-600 text-white border-red-600' },
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => handleStatusChange(worker.user_id, status.id)}
                  className={`flex-1 sm:flex-none px-4 py-3 rounded-xl text-xs font-black transition-all border-2 ${
                    attendance[worker.user_id] === status.id
                      ? status.activeColor
                      : 'bg-white dark:bg-gray-700 text-gray-400 border-gray-100 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  {status.label}
                </button>
              ))}

              {/* Kaydediliyor / Kaydedildi İndikatörü */}
              <div className="w-10 h-10 flex items-center justify-center ml-2">
                {saving === worker.user_id ? (
                  <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                ) : saved === worker.user_id ? (
                  <div className="bg-green-100 text-green-600 p-2 rounded-full animate-bounce">
                    <Check size={20} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}
