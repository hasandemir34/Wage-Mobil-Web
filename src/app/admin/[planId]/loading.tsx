export default function DashboardLoading() {
  return (
    <div className="space-y-10 pb-24 animate-pulse">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />

      {/* 3 özet kart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="h-44 bg-indigo-100 dark:bg-indigo-900/30 rounded-[2rem]" />
        <div className="h-44 bg-gray-100 dark:bg-gray-800 rounded-[2rem]" />
        <div className="h-44 bg-gray-100 dark:bg-gray-800 rounded-[2rem]" />
      </div>

      {/* Alt panel */}
      <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-[2rem] max-w-sm" />
    </div>
  )
}
