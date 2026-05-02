'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface AttendanceRecord {
  date: string
  status: string
  is_concrete?: boolean
}

export default function WorkerCalendar({ attendance }: { attendance: AttendanceRecord[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Ayın günlerini hesapla
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  
  // Pazartesi'yi haftanın ilk günü yap (JS'de 0 Pazardır)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const days = []
  for (let i = 0; i < startingDay; i++) {
    days.push(null) // Ay öncesi boşluklar
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
    return attendance.find(a => a.date === dateStr)
  }

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
          const isConcrete = record?.is_concrete

          return (
            <div 
              key={idx} 
              className={`
                aspect-square flex items-center justify-center text-lg sm:text-2xl font-black transition-all relative rounded-full min-h-[40px] sm:min-h-[44px]
                ${!day ? 'bg-transparent' : 'text-gray-400'}
                ${status === 'present' ? 'text-green-500' : ''}
                ${status === 'half_day' ? 'text-orange-500' : ''}
                ${status === 'absent' ? 'text-red-500' : ''}
                ${isConcrete ? 'ring-2 sm:ring-4 ring-orange-500 ring-offset-1 sm:ring-offset-2 dark:ring-offset-gray-800 shadow-lg shadow-orange-500/20' : ''}
              `}
            >
              {day}
              {isConcrete && (
                <div className="absolute -top-0.5 -right-0.5">
                  <div className="bg-orange-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
