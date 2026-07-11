'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Wallet, TrendingUp, History, X, FileText, ArrowRight } from 'lucide-react'
import WorkerCalendar from './WorkerCalendar'

interface Membership {
  plan_id: string
  full_name: string
  base_daily_wage?: number | string
  work_plans: {
    name: string
  }
}

interface AdvanceRecord {
  id?: string
  date: string
  amount: number
  description?: string
}

interface AttendanceRecord {
  date: string
  status: string
  concrete_bonus?: number
  aks_bonus?: number
}

interface WorkerDashboardClientProps {
  params: {
    planId: string
  }
  membership: Membership
  attendance: AttendanceRecord[]
  advances: AdvanceRecord[]
}

export default function WorkerDashboardClient({ params, membership, attendance, advances }: WorkerDashboardClientProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const baseWage = Number(membership.base_daily_wage || 0)

  const summary = useMemo(() => {
    const totalWorkedDays = attendance.filter(record => record.status === 'present').length
    const totalWages = attendance.reduce((sum, record) => sum + (record.status === 'present' ? baseWage : 0), 0)
    const totalConcrete = attendance.reduce((sum, record) => sum + Number(record.concrete_bonus || 0), 0)
    const totalAks = attendance.reduce((sum, record) => sum + Number(record.aks_bonus || 0), 0)
    const totalEarned = totalWages + totalConcrete + totalAks
    const totalAdvances = advances.reduce((sum, item) => sum + Number(item.amount), 0)

    return {
      totalWorkedDays,
      totalWages,
      totalConcrete,
      totalAks,
      totalEarned,
      totalAdvances,
      netBalance: totalEarned - totalAdvances,
    }
  }, [attendance, advances, baseWage])

  const formatCurrency = (amount: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 relative">
      <div className="rounded-[2.5rem] border border-slate-200 bg-white/95 p-6 shadow-2xl shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-none">
        <div className="flex flex-col gap-2 px-2">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Merhaba, {(membership.full_name || 'İşçi').split(' ')[0]}!</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
            <span>{membership.work_plans.name}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 dark:text-indigo-300">Yevmiye: {formatCurrency(baseWage)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-[2.5rem] bg-emerald-600 p-8 text-white shadow-2xl shadow-emerald-600/20 border-b-8 border-emerald-800">
            <div className="flex items-center gap-3 mb-4 opacity-90">
              <Wallet size={22} />
              <p className="text-xs font-black uppercase tracking-[0.28em]">Kalan Alacak</p>
            </div>
            <div className="text-5xl font-black tracking-tight tabular-nums">{formatCurrency(summary.netBalance)}</div>
            <div className="mt-6 space-y-3 border-t border-white/20 pt-5 text-sm">
              <div className="flex justify-between opacity-90">
                <span>Yevmiye Toplamı</span>
                <span>{formatCurrency(summary.totalWages)}</span>
              </div>
              <div className="flex justify-between opacity-90">
                <span>Ek Mesai (Beton + Aks)</span>
                <span>{formatCurrency(summary.totalConcrete + summary.totalAks)}</span>
              </div>
              <div className="flex justify-between text-red-200 font-black">
                <span>Alınan Avans</span>
                <span>-{formatCurrency(summary.totalAdvances)}</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="text-indigo-600" size={20} />
                <span className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Toplam Kazanç</span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(summary.totalEarned)}</p>
            </div>

            <button
              onClick={() => setShowCalendar(true)}
              className="rounded-[2rem] border-2 border-indigo-100 bg-white p-6 text-left shadow-sm transition-all hover:border-indigo-300 active:scale-[0.99] dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center gap-3 mb-3">
                <CalendarDays className="text-orange-500" size={20} />
                <span className="text-xs font-black uppercase tracking-[0.28em] text-slate-400">Çalışılan Gün</span>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{summary.totalWorkedDays} Gün</p>
                <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300">Detay</span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href={`/worker/${params.planId}/report`}
            className="group block overflow-hidden rounded-[2.5rem] border border-dashed border-indigo-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.28em] text-slate-900 dark:text-white">Çalışma Raporu</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Tüm hakediş ve puantaj dökümü</p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between text-xs font-bold uppercase tracking-[0.28em] text-slate-500 transition-colors group-hover:text-indigo-600">
              <span>Raporu görüntüle</span>
              <ArrowRight size={18} />
            </div>
          </Link>

          <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3 mb-4 text-slate-500 dark:text-slate-400">
              <History size={18} />
              <span className="text-xs font-black uppercase tracking-[0.28em]">Son Avanslar</span>
            </div>
            <div className="space-y-3">
              {advances.slice(0, 5).map((adv, index) => (
                <div key={adv.id ?? index} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(adv.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{adv.description || 'Nakit avans'}</p>
                  </div>
                  <p className="text-sm font-black text-red-600 dark:text-red-400">-{formatCurrency(adv.amount)}</p>
                </div>
              ))}
              {advances.length === 0 && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs font-black uppercase tracking-[0.28em] text-slate-400 dark:border-slate-700 dark:bg-slate-900">
                  Henüz avans kaydı yok
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setShowCalendar(false)}
              className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <X size={22} />
            </button>
            <div className="mt-10">
              <WorkerCalendar attendance={attendance} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
