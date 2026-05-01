import { createClient } from '@/utils/supabase/server'
import { CalendarDays, Banknote, Clock, Calculator } from 'lucide-react'

export default async function WorkerDashboard({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Bu plandaki üyelik bilgisini çek
  const { data: membership } = await supabase
    .from('work_plan_members')
    .select('*, work_plans(name)')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return <div>Yetkiniz yok.</div>

  // Devamsızlık ve Mesai bilgisi
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('plan_id', planId)
    .eq('worker_id', user.id)

  // Avanslar
  const { data: advances } = await supabase
    .from('advances')
    .select('*')
    .eq('plan_id', planId)
    .eq('worker_id', user.id)

  const baseWage = Number(membership.base_daily_wage || 0)
  
  // Hesaplamalar
  const totalDaysWorked = attendance?.filter(a => a.status === 'present').length || 0
  const totalAdvances = advances?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  
  let totalOvertimeEarnings = 0
  attendance?.forEach(record => {
    if (record.overtime_hours > 0) {
      const hourlyRate = baseWage / 8
      const multiplier = Number(record.multiplier) || 1.5
      totalOvertimeEarnings += (hourlyRate * multiplier * Number(record.overtime_hours))
    }
  })

  const baseEarnings = totalDaysWorked * baseWage
  const netBalance = baseEarnings + totalOvertimeEarnings - totalAdvances

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Selam, {membership.full_name}!</h1>
        <p className="text-xl text-gray-500 font-medium">
          <span className="text-indigo-600">{membership.work_plans.name}</span> şantiyesi özeti.
        </p>
      </div>

      {/* DEV ÖZET KARTI */}
      <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-600/40 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-indigo-200 text-sm font-black uppercase tracking-widest">Kazanç</p>
            <p className="text-3xl font-black">₺{Math.round(baseEarnings + totalOvertimeEarnings).toLocaleString('tr-TR')}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-indigo-200 text-sm font-black uppercase tracking-widest">Avans</p>
            <p className="text-3xl font-black text-red-300">-₺{totalAdvances.toLocaleString('tr-TR')}</p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-indigo-500/50 flex flex-col items-center">
          <p className="text-indigo-100 text-lg font-bold uppercase tracking-[0.2em] mb-2">KALAN NET ALACAK</p>
          <p className="text-7xl font-black tabular-nums tracking-tighter">₺{Math.round(netBalance).toLocaleString('tr-TR')}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest px-4">Çalışma Geçmişi</h3>
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl p-6 border border-gray-100 dark:border-gray-700">
          {attendance?.length ? (
            <div className="space-y-4">
              {attendance.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                <div key={record.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
                    </p>
                    {record.overtime_hours > 0 && (
                      <p className="text-sm font-bold text-indigo-500 uppercase">+{record.overtime_hours} SAAT MESAİ</p>
                    )}
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase ${record.status === 'present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {record.status === 'present' ? 'Geldİ' : 'Gelmedİ'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-10 text-gray-400 font-bold">Henüz kayıt bulunmuyor.</p>
          )}
        </div>
      </div>
    </div>
  )
}
