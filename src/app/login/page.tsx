import { login, signup } from './actions'

interface LoginPageProps {
  searchParams: Promise<{ message?: string; success?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { message, success } = await searchParams
  const decodedMessage = message ? decodeURIComponent(message) : undefined
  const decodedSuccess = success ? decodeURIComponent(success) : undefined

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950/5 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-8 py-10 text-white">
          <div className="flex items-center justify-center rounded-3xl bg-white/10 p-4 shadow-lg shadow-white/10 mb-6">
            <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Yevmiye Takip</h1>
          <p className="mt-3 max-w-xl text-sm font-medium text-indigo-100/90">
            İşçi yevmiye ve proje takibini hızlı, güvenilir ve profesyonel bir arayüzle yönetin.
          </p>
        </div>

        <div className="px-8 py-10 sm:px-10">
          {decodedMessage && (
            <div className="rounded-3xl border border-red-200/80 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-950/40 dark:text-red-200">
              {decodedMessage}
            </div>
          )}
          {decodedSuccess && (
            <div className="rounded-3xl border border-emerald-200/80 bg-emerald-50 p-5 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-200">
              {decodedSuccess}
            </div>
          )}

          <form className="mt-6 space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Kullanıcı Adı
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
                    placeholder="Örn: ahmet_usta"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    Şifre
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    minLength={6}
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
                    placeholder="En az 6 karakter"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <button formAction={login} className="inline-flex h-14 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-xl shadow-indigo-500/20 transition hover:bg-indigo-500 active:scale-[0.98]">
                Giriş Yap
              </button>
              <button formAction={signup} className="inline-flex h-14 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                Kayıt Ol
              </button>
            </div>

            <div className="relative text-center text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="bg-white px-3 dark:bg-slate-900">veya</span>
              <div className="absolute left-0 top-1/2 h-px w-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Mevcut şantiyenizi seçin ve tüm günlük işlemleri hızlıca yönetin.
          </p>
        </div>
      </div>
    </div>
  )
}
