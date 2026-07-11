export default function WorkerPageLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 px-4">
      <div className="h-24 rounded-[2.5rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="h-72 rounded-[2.5rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 rounded-[2rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-40 rounded-[2rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-28 rounded-[2.5rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-52 rounded-[2.5rem] bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
