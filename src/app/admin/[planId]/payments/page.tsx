import { createClient } from '@/utils/supabase/server'
import { Wallet, ArrowLeft, TrendingUp, Banknote, CalendarCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import PaymentForm from './PaymentForm'

interface WorkerMember {
  user_id: string
  full_name: string
  base_daily_wage: number
  profiles: { username: string } | null
}

export default async function PaymentsPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: rawWorkers },
    { data: allAttendance },
    { data: allAdvances },
  ] = await Promise.all([
    supabase
      .from('work_plan_members')
      .select('user_id, full_name, base_daily_wage, profiles(username)')
      .eq('plan_id', planId),
    supabase
      .from('attendance')
      .select('worker_id, status, concrete_bonus, aks_bonus')
      .eq('plan_id', planId),
    supabase
      .from('advances')
      .select('worker_id, amount')
      .eq('plan_id', planId),
  ])

  const workers = (rawWorkers as WorkerMember[] | null)?.map(w =>
    w.user_id === user?.id ? { ...w, full_name: 'Ben' } : w
  ) || []

  const report = workers.map(worker => {
    const workerAttendance = allAttendance?.filter(a => a.worker_id === worker.user_id) || []
    const workerAdvances = allAdvances?.filter(a => a.worker_id === worker.user_id) || []

    const wage = Number(worker.base_daily_wage || 0)
    const presentDays = workerAttendance.filter(a => a.status === 'present').length
    const baseWageTotal = presentDays * wage
    const concreteBonus = workerAttendance.reduce((sum, a) => sum + Number((a as any).concrete_bonus || 0), 0)
    const aksBonus = workerAttendance.reduce((sum, a) => sum + Number((a as any).aks_bonus || 0), 0)
    const earned = baseWageTotal + concreteBonus + aksBonus
    const advanced = workerAdvances.reduce((sum, adv) => sum + Number(adv.amount), 0)

    return {
      id: worker.user_id,
      name: worker.full_name,
      username: worker.profiles?.username ?? '',
      wage,
      presentDays,
      baseWageTotal,
      concreteBonus,
      aksBonus,
      earned,
      advanced,
      balance: earned - advanced
    }
  }).sort((a, b) => b.balance - a.balance)

  const totalDebt = report?.reduce((sum, item) => sum + item.balance, 0) || 0

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center gap-4">
        <Link href={`/admin/${planId}`} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Ödeme Detayları</h2>
          <p className="text-gray-500 font-medium">İşçi bazlı borç ve hakediş dökümü.</p>
        </div>
      </div>

      {/* Genel Borç Özeti */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20">
        <div className="flex items-center gap-3 mb-2 opacity-80">
          <Wallet size={20} />
          <p className="text-xs font-black uppercase tracking-widest">Toplam Mali Yükümlülük</p>
        </div>
        <div className="text-5xl font-black tabular-nums">₺{totalDebt.toLocaleString('tr-TR')}</div>
      </div>

      {/* Ödeme Formu Component'i */}
      <PaymentForm planId={planId} workers={report || []} />

      <div className="grid gap-6">
        {report?.map(item => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
            {/* Başlık */}
            <div className="flex items-center justify-between">
              <Link href={`/admin/${planId}/workers/${item.id}`} className="hover:opacity-70 transition-opacity group">
                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                <p className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors">@{item.username}</p>
              </Link>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Net Alacak</p>
                <p className={`text-3xl font-black ${item.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  ₺{item.balance.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>

            {/* Detay Satırları */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-500 font-bold">
                  <CalendarCheck size={15} className="text-indigo-400" />
                  Çalışılan Gün × Yevmiye
                </span>
                <span className="font-black text-gray-700 dark:text-gray-200">
                  {item.presentDays} gün × ₺{item.wage.toLocaleString('tr-TR')} = ₺{item.baseWageTotal.toLocaleString('tr-TR')}
                </span>
              </div>
              {item.concreteBonus > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500 font-bold">
                    <Zap size={15} className="text-yellow-500" />
                    Beton Prim
                  </span>
                  <span className="font-black text-yellow-600">+₺{item.concreteBonus.toLocaleString('tr-TR')}</span>
                </div>
              )}
              {item.aksBonus > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-500 font-bold">
                    <Zap size={15} className="text-orange-500" />
                    Aks Prim
                  </span>
                  <span className="font-black text-orange-600">+₺{item.aksBonus.toLocaleString('tr-TR')}</span>
                </div>
              )}
            </div>

            {/* Özet Satırı */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl">
                <TrendingUp className="text-indigo-500 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Toplam Hakediş</p>
                  <p className="font-black text-indigo-700 dark:text-indigo-300">₺{item.earned.toLocaleString('tr-TR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl">
                <Banknote className="text-red-500 shrink-0" size={20} />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Ödenen (Avans+Maaş)</p>
                  <p className="font-black text-red-600 dark:text-red-400">₺{item.advanced.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
