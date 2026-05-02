export default function WorkersLoading() {
  return (
    <div className="space-y-12 pb-24 animate-pulse">
      <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />

      {/* Form iskelet */}
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 p-8 space-y-6">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-600 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
          <div className="h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
          <div className="h-14 bg-gray-200 dark:bg-gray-600 rounded-2xl" />
        </div>
      </div>

      {/* Tablo iskelet */}
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-8 py-6 gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
              </div>
              <div className="h-5 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />
              <div className="h-9 w-20 bg-gray-200 dark:bg-gray-600 rounded-xl ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
