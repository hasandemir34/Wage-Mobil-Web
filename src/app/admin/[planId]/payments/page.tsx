import { createClient } from '@/utils/supabase/server'
import { Wallet, ArrowLeft, TrendingUp, Banknote } from 'lucide-react'
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

  const [
    { data: workers },
    { data: allAttendance },
    { data: allAdvances },
  ] = await Promise.all([
    supabase
      .from('work_plan_members')
      .select('user_id, full_name, base_daily_wage, profiles(username)')
      .eq('plan_id', planId)
      .eq('role', 'worker'),
    supabase
      .from('attendance')
      .select('worker_id, status')
      .eq('plan_id', planId),
    supabase
      .from('advances')
      .select('worker_id, amount')
      .eq('plan_id', planId),
  ])

  const report = (workers as WorkerMember[] | null)?.map(worker => {
    const workerAttendance = allAttendance?.filter(a => a.worker_id === worker.user_id) || []
    const workerAdvances = allAdvances?.filter(a => a.worker_id === worker.user_id) || []

    const wage = Number(worker.base_daily_wage || 0)

    const earned = workerAttendance.reduce((sum, att) => {
      if (att.status === 'present') return sum + wage
      return sum
    }, 0)

    const advanced = workerAdvances.reduce((sum, adv) => sum + Number(adv.amount), 0)

    return {
      id: worker.user_id,
      name: worker.full_name,
      username: worker.profiles?.username ?? '',
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
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-700 pb-4">
              <Link href={`/admin/${planId}/workers/${item.id}`} className="hover:opacity-70 transition-opacity group">
                <h3 className="text-xl font-black text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                <p className="text-sm font-bold text-gray-400 group-hover:text-indigo-400 transition-colors">@{item.username}</p>
              </Link>
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 uppercase mb-1">Net Alacak</p>
                <p className={`text-2xl font-black ${item.balance > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  ₺{item.balance.toLocaleString('tr-TR')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                <TrendingUp className="text-indigo-500" size={20} />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Toplam Hakediş</p>
                  <p className="font-bold text-gray-900 dark:text-white">₺{item.earned.toLocaleString('tr-TR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                <Banknote className="text-red-500" size={20} />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Ödenen Avans</p>
                  <p className="font-bold text-gray-900 dark:text-white">₺{item.advanced.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
