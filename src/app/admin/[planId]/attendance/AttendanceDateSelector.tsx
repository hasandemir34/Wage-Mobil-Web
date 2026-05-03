'use client'

import { useRouter } from 'next/navigation'

export default function AttendanceDateSelector({ 
  planId, 
  selectedDate, 
  maxDate 
}: { 
  planId: string, 
  selectedDate: string, 
  maxDate: string 
}) {
  const router = useRouter()

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    router.push(`/admin/${planId}/attendance?date=${newDate}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {selectedDate !== maxDate && (
        <button 
          onClick={() => router.push(`/admin/${planId}/attendance`)}
          className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest active:scale-95"
        >
          Bugüne Dön
        </button>
      )}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-xl border-2 border-indigo-100 dark:border-indigo-900 flex items-center gap-4">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tarih Değiştir:</label>
        <input 
          key={selectedDate}
          type="date" 
          defaultValue={selectedDate}
          max={maxDate}
          onChange={handleDateChange}
          className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl font-bold border-none outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
        />
      </div>
    </div>
  )
}
