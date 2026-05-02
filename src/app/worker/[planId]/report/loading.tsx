export default function WorkerReportLoading() {
  return (
    <div className="bg-white min-h-screen p-4 sm:p-10 animate-pulse">
      <div className="h-10 w-36 bg-gray-200 rounded-xl mb-8" />

      <div className="max-w-4xl mx-auto border-2 border-gray-100 p-4 sm:p-12 rounded-[3rem] space-y-10">
        {/* Başlık */}
        <div className="flex justify-between items-start border-b-4 border-indigo-100 pb-8">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-gray-200 rounded-xl" />
            <div className="h-6 w-40 bg-indigo-100 rounded-lg" />
          </div>
          <div className="h-14 w-28 bg-gray-100 rounded-xl" />
        </div>

        {/* 3 özet kart */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-indigo-50 rounded-[2rem]" />
          <div className="h-24 bg-red-50 rounded-[2rem]" />
          <div className="h-24 bg-green-100 rounded-[2rem]" />
        </div>

        {/* Tablo */}
        <div className="space-y-3">
          <div className="h-12 bg-gray-800 rounded-t-2xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
