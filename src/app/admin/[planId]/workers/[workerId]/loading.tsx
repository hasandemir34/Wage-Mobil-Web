export default function WorkerDetailLoading() {
  return (
    <div className="space-y-10 pb-20 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-5 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="ml-auto flex gap-3">
          <div className="h-16 w-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl" />
          <div className="h-16 w-32 bg-orange-100 dark:bg-orange-900/30 rounded-3xl" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Puantaj geçmişi */}
        <div className="space-y-3">
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700" />
          ))}
        </div>

        {/* Avans geçmişi */}
        <div className="space-y-3">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700" />
          ))}
        </div>
      </div>
    </div>
  )
}
