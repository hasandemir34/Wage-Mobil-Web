import { ReactNode } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Users, CalendarDays, WalletCards, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/worker')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 hidden md:flex md:flex-col">
        <div className="flex h-16 flex-shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Yevmiye Admin</h1>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-4">
          <nav className="flex-1 space-y-2">
            <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 transition-colors">
              <LayoutDashboard className="h-5 w-5 text-gray-500" />
              <span>Özet</span>
            </Link>
            <Link href="/admin/workers" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
              <Users className="h-5 w-5 text-gray-400" />
              <span>İşçiler</span>
            </Link>
            <Link href="/admin/attendance" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
              <CalendarDays className="h-5 w-5 text-gray-400" />
              <span>Devamsızlık/Mesai</span>
            </Link>
            <Link href="/admin/advances" className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
              <WalletCards className="h-5 w-5 text-gray-400" />
              <span>Avanslar</span>
            </Link>
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
          <form action="/auth/signout" method="post" className="w-full">
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
              <LogOut className="h-5 w-5" />
              <span>Çıkış Yap</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden flex h-16 items-center border-b border-gray-200 bg-white px-4 dark:bg-gray-800 dark:border-gray-700">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Yevmiye Admin</h1>
        </div>
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
