'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface AttendanceRecord {
  date: string
  status: string
  concrete_bonus?: number
  aks_bonus?: number
}

export default function WorkerCalendar({ attendance }: { attendance: AttendanceRecord[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days = []
  for (let i = 0; i < startingDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ]

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getRecord = (day: number) => {
    if (!day) return null
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return attendance.find(a => a.date.slice(0, 10) === dateStr) ?? null
  }

  // SVG ring constants
  const r = 19
  const circ = 2 * Math.PI * r
  const half = circ / 2

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 shadow-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-1 sm:px-2">
        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="text-indigo-600" size={24} />
          {months[month]} {year}
        </h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-3 w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-indigo-50 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="p-3 w-12 h-12 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-2xl hover:bg-indigo-50 transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {['Pt', 'Sa', 'Çr', 'Pr', 'Cu', 'Ct', 'Pz'].map(d => (
          <div key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const record = day ? getRecord(day) : null
          const status = record?.status
          const hasConcrete = record ? Number(record.concrete_bonus || 0) > 0 : false
          const hasAks = record ? Number(record.aks_bonus || 0) > 0 : false
          const onlyConcrete = hasConcrete && !hasAks
          const onlyAks = hasAks && !hasConcrete
          const bothExtras = hasConcrete && hasAks

          const textColor = !day
            ? ''
            : status === 'present'
            ? 'text-green-500'
            : status === 'absent'
            ? 'text-red-500'
            : 'text-gray-300'

          return (
            <div
              key={idx}
              className={`
                aspect-square flex items-center justify-center text-lg sm:text-2xl font-black transition-all relative rounded-full min-h-[40px] sm:min-h-[44px]
                ${!day ? 'bg-transparent' : textColor}
              `}
            >
              {day}
              {(onlyConcrete || onlyAks || bothExtras) && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 44 44"
                >
                  {onlyConcrete && (
                    <circle cx="22" cy="22" r={r} fill="none" stroke="#f97316" strokeWidth="3" />
                  )}
                  {onlyAks && (
                    <circle cx="22" cy="22" r={r} fill="none" stroke="#dc2626" strokeWidth="3" />
                  )}
                  {bothExtras && (
                    <>
                      <circle cx="22" cy="22" r={r} fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${half} ${circ}`} strokeDashoffset="0" transform="rotate(-90, 22, 22)" />
                      <circle cx="22" cy="22" r={r} fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray={`${half} ${circ}`} strokeDashoffset={`${-half}`} transform="rotate(-90, 22, 22)" />
                    </>
                  )}
                </svg>
              )}
            </div>
          )
        })}
      </div>

      {/* Açıklama */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
        {/* Renk göstergesi */}
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-green-500 text-lg font-black leading-none">●</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Geldi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-500 text-lg font-black leading-none">●</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Gelmedi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-300 text-lg font-black leading-none">●</span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Yoklama Yok</span>
          </div>
        </div>

        <p className="text-[9px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] text-center">Halka Göstergesi</p>
        <div className="flex items-stretch gap-2 justify-center">
          <div className="flex-1 max-w-[90px] flex flex-col items-center gap-2 bg-orange-50 dark:bg-orange-950/30 rounded-2xl p-3">
            <div className="w-7 h-7 rounded-full ring-[3px] ring-orange-500 ring-offset-2 ring-offset-orange-50 dark:ring-offset-gray-800" />
            <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider text-center leading-tight">Sadece<br/>Beton</span>
          </div>
          <div className="flex-1 max-w-[90px] flex flex-col items-center gap-2 bg-red-50 dark:bg-red-950/30 rounded-2xl p-3">
            <div className="w-7 h-7 rounded-full ring-[3px] ring-red-600 ring-offset-2 ring-offset-red-50 dark:ring-offset-gray-800" />
            <span className="text-[9px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider text-center leading-tight">Sadece<br/>Aks</span>
          </div>
          <div className="flex-1 max-w-[90px] flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-3">
            <svg width="28" height="28" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={r} fill="none" stroke="#f97316" strokeWidth="5" strokeDasharray={`${half} ${circ}`} strokeDashoffset="0" transform="rotate(-90, 22, 22)" />
              <circle cx="22" cy="22" r={r} fill="none" stroke="#dc2626" strokeWidth="5" strokeDasharray={`${half} ${circ}`} strokeDashoffset={`${-half}`} transform="rotate(-90, 22, 22)" />
            </svg>
            <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center leading-tight">Beton<br/>+ Aks</span>
          </div>
        </div>
      </div>
    </div>
  )
}
