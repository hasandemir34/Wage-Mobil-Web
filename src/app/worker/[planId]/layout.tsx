import { ReactNode } from 'react'
import Link from 'next/link'
import { LogOut, Wallet } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function WorkerLayout({ 
  children,
  params
}: { 
  children: ReactNode,
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('work_plan_members')
    .select('role')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    // Üye değilse ana sayfaya at
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Yevmiye Takip</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link href="/" className="text-[10px] sm:text-sm font-bold text-gray-500 hover:text-indigo-600 transition-colors uppercase">
                Plan Değiştir
              </Link>
              <form action="/auth/signout" method="post">
                <button className="flex items-center gap-2 rounded-xl bg-red-50 px-3 sm:px-4 py-2 text-[10px] sm:text-sm font-black text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 transition-colors active:scale-95 shadow-sm uppercase">
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Çıkış</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
