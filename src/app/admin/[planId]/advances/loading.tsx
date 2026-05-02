export default function AdvancesLoading() {
  return (
    <div className="space-y-12 pb-24 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-6 w-96 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>

      {/* Form iskelet */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
          <div className="h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
          <div className="h-14 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
        </div>
        <div className="h-14 w-40 bg-gray-200 dark:bg-gray-600 rounded-2xl" />
      </div>

      {/* Tablo iskelet */}
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 pb-4">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-8 py-6 gap-4">
              <div className="h-5 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg" />
              <div className="h-5 w-36 bg-gray-100 dark:bg-gray-700 rounded-lg" />
              <div className="h-7 w-20 bg-gray-200 dark:bg-gray-600 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
