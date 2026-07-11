import WorkerDashboardClient from './WorkerDashboardClient'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function WorkerDashboard({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [membershipRes, attendanceRes, advancesRes] = await Promise.all([
    supabase
      .from('work_plan_members')
      .select('*, work_plans(name)')
      .eq('plan_id', planId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('attendance')
      .select('date, status, concrete_bonus, aks_bonus')
      .eq('plan_id', planId)
      .eq('worker_id', user.id)
      .order('date', { ascending: false }),
    supabase
      .from('advances')
      .select('amount, date, description')
      .eq('plan_id', planId)
      .eq('worker_id', user.id)
      .order('date', { ascending: false }),
  ])

  if (!membershipRes.data) {
    redirect('/')
  }

  return (
    <WorkerDashboardClient
      params={{ planId }}
      membership={membershipRes.data}
      attendance={attendanceRes.data || []}
      advances={advancesRes.data || []}
    />
  )
}

