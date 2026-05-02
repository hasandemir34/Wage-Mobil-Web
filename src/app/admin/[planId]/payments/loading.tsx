export default function PaymentsLoading() {
  return (
    <div className="space-y-10 pb-20 animate-pulse">
      <div className="h-10 w-56 bg-gray-200 dark:bg-gray-700 rounded-2xl" />

      {/* Toplam borç kartı */}
      <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-[2.5rem] p-8">
        <div className="h-5 w-40 bg-indigo-200 dark:bg-indigo-800 rounded-lg mb-4" />
        <div className="h-12 w-48 bg-indigo-200 dark:bg-indigo-800 rounded-xl" />
      </div>

      {/* İşçi kartları */}
      <div className="grid gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex justify-between pb-4 border-b border-gray-50 dark:border-gray-700">
              <div className="space-y-2">
                <div className="h-6 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              </div>
              <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
              <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
