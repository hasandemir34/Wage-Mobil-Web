'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CalendarDays, WalletCards } from 'lucide-react'

export function SidebarNav({ planId }: { planId: string }) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 transition-colors font-bold ${
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
    }`

  const iconClass = (active: boolean) =>
    `h-5 w-5 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-indigo-400'}`

  return (
    <nav className="flex-1 space-y-2">
      <Link href={`/admin/${planId}/attendance`} className={linkClass(isActive(`/admin/${planId}/attendance`))}>
        <CalendarDays className={iconClass(isActive(`/admin/${planId}/attendance`))} />
        <span>Puantaj</span>
      </Link>
      <Link href={`/admin/${planId}/advances`} className={linkClass(isActive(`/admin/${planId}/advances`))}>
        <WalletCards className={iconClass(isActive(`/admin/${planId}/advances`))} />
        <span>Avans/Ödeme</span>
      </Link>
      <Link href={`/admin/${planId}`} className={linkClass(isActive(`/admin/${planId}`, true))}>
        <LayoutDashboard className={iconClass(isActive(`/admin/${planId}`, true))} />
        <span>Özet</span>
      </Link>
      <Link href={`/admin/${planId}/workers`} className={linkClass(isActive(`/admin/${planId}/workers`))}>
        <Users className={iconClass(isActive(`/admin/${planId}/workers`))} />
        <span>İşçiler</span>
      </Link>
    </nav>
  )
}

export function BottomNav({ planId }: { planId: string }) {
  const pathname = usePathname()

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const linkClass = (active: boolean) =>
    `flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all ${
      active
        ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
        : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600'
    }`

  const spanClass = (active: boolean) =>
    `text-[10px] font-black uppercase tracking-tighter ${active ? 'text-indigo-600 dark:text-indigo-400' : ''}`

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 flex items-center justify-around h-20 px-2 pb-safe print:hidden">
      <Link href={`/admin/${planId}/attendance`} className={linkClass(isActive(`/admin/${planId}/attendance`))}>
        <CalendarDays className="h-6 w-6" />
        <span className={spanClass(isActive(`/admin/${planId}/attendance`))}>Puantaj</span>
      </Link>
      <Link href={`/admin/${planId}/advances`} className={linkClass(isActive(`/admin/${planId}/advances`))}>
        <WalletCards className="h-6 w-6" />
        <span className={spanClass(isActive(`/admin/${planId}/advances`))}>Avans/Ödeme</span>
      </Link>
      <Link href={`/admin/${planId}`} className={linkClass(isActive(`/admin/${planId}`, true))}>
        <LayoutDashboard className="h-6 w-6" />
        <span className={spanClass(isActive(`/admin/${planId}`, true))}>Özet</span>
      </Link>
      <Link href={`/admin/${planId}/workers`} className={linkClass(isActive(`/admin/${planId}/workers`))}>
        <Users className="h-6 w-6" />
        <span className={spanClass(isActive(`/admin/${planId}/workers`))}>İşçiler</span>
      </Link>
    </nav>
  )
}
