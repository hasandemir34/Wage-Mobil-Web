import { createClient } from '@/utils/supabase/server'
import AdvanceForm from './AdvanceForm'
import PaymentForm from '../payments/PaymentForm'
import RecentTransactions from './RecentTransactions'

export default async function AdvancesPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: allMembers }, { data: advances }, { data: allAttendance }] = await Promise.all([
    supabase
      .from('work_plan_members')
      .select('*, profiles(username)')
      .eq('plan_id', planId),
    supabase
      .from('advances')
      .select('*')
      .eq('plan_id', planId)
      .order('date', { ascending: false }),
    supabase
      .from('attendance')
      .select('worker_id, status, concrete_bonus, aks_bonus')
      .eq('plan_id', planId),
  ])

  const today = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const members = (allMembers || []).map(m =>
    m.user_id === user?.id ? { ...m, full_name: 'Ben' } : m
  )

  const workersWithBalance = members.map(member => {
    const wage = Number(member.base_daily_wage || 0)
    const earned = (allAttendance || [])
      .filter(a => a.worker_id === member.user_id)
      .reduce((sum, a) => a.status === 'present' ? sum + wage + Number((a as any).concrete_bonus || 0) + Number((a as any).aks_bonus || 0) : sum, 0)
    const advanced = (advances || [])
      .filter(a => a.worker_id === member.user_id)
      .reduce((sum, a) => sum + Number(a.amount), 0)
    return {
      id: member.user_id,
      name: member.full_name,
      username: (member as any).profiles?.username ?? '',
      earned,
      advanced,
      balance: earned - advanced,
    }
  })

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Avans / Ödeme Kayıtları</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">İşçilere verilen avansları ve yapılan ödemeleri kaydedin.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AdvanceForm planId={planId} workers={members} today={today} />
        <PaymentForm planId={planId} workers={workersWithBalance} today={today} />
      </div>

      <RecentTransactions advances={advances || []} members={members} />
    </div>
  )
}
