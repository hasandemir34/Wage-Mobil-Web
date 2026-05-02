export default function AttendanceLoading() {
  return (
    <div className="space-y-8 pb-24 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />

      {/* Tarih seçici iskelet */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 h-20 w-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
        ))}
      </div>

      {/* İşçi listesi iskelet */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-8 py-5 gap-4">
              <div className="space-y-1.5">
                <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              </div>
              <div className="flex gap-2 ml-auto">
                <div className="h-10 w-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                <div className="h-10 w-20 bg-gray-100 dark:bg-gray-700 rounded-xl" />
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-600 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
