export default function ReportLoading() {
  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 animate-pulse">
      <div className="h-12 w-40 bg-gray-200 rounded-2xl mb-8" />

      <div className="max-w-5xl mx-auto border-2 border-gray-100 p-6 sm:p-12 rounded-[3rem] space-y-10">
        {/* Başlık */}
        <div className="flex justify-between items-start border-b-4 border-gray-200 pb-8">
          <div className="space-y-3">
            <div className="h-10 w-72 bg-gray-200 rounded-xl" />
            <div className="h-6 w-48 bg-indigo-100 rounded-lg" />
          </div>
          <div className="h-16 w-32 bg-gray-100 rounded-xl" />
        </div>

        {/* Tablo */}
        <div className="space-y-4">
          <div className="h-14 bg-gray-200 rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>

        {/* Alt 3 sütun */}
        <div className="grid grid-cols-3 gap-6">
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
