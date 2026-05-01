import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarDays, WalletCards, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ 
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

  // Bu plana üye mi ve admin mi kontrol et
  const { data: membership } = await supabase
    .from('work_plan_members')
    .select('role, work_plans(name)')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 hidden md:flex md:flex-col">
        <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
            {membership.work_plans.name}
          </h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <nav className="flex-1 space-y-2">
            <Link href={`/admin/${planId}`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors font-bold">
              <LayoutDashboard className="h-5 w-5 text-indigo-500" />
              <span>Özet</span>
            </Link>
            <Link href={`/admin/${planId}/workers`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors font-bold">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>İşçiler</span>
            </Link>
            <Link href={`/admin/${planId}/attendance`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors font-bold">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              <span>Devamsızlık</span>
            </Link>
            <Link href={`/admin/${planId}/advances`} className="flex items-center gap-3 rounded-xl px-3 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors font-bold">
              <WalletCards className="h-5 w-5 text-indigo-500" />
              <span>Avanslar</span>
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-gray-200 p-4 dark:border-gray-700">
          <Link href="/" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors font-bold">
            <LayoutDashboard className="h-5 w-5" />
            <span>Plan Değiştir</span>
          </Link>
          <form action="/auth/signout" method="post" className="w-full">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors font-bold">
              <LogOut className="h-5 w-5" />
              <span>Çıkış Yap</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:bg-gray-800 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[60%]">
            {membership.work_plans.name}
          </h1>
          <form action="/auth/signout" method="post">
            <button className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-black text-red-600 hover:bg-red-100 active:scale-95 transition-all">
              <LogOut className="h-4 w-4" />
              <span>Çıkış</span>
            </button>
          </form>
        </div>
        <div className="p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
