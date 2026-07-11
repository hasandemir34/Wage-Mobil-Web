export default function AppLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-5xl space-y-8 animate-pulse">
        <div className="h-20 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-52 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
          <div className="h-52 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
          <div className="h-52 rounded-[2rem] bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-96 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}
