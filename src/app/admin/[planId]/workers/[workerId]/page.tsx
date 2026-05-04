import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, Calendar, History, Banknote, User, HardHat } from 'lucide-react'
import Link from 'next/link'
import WorkerCalendar from '@/app/worker/[planId]/WorkerCalendar'

export default async function WorkerDetailPage({ 
  params 
}: { 
  params: Promise<{ planId: string, workerId: string }> 
}) {
  const { planId, workerId } = await params
  const supabase = await createClient()

  const [{ data: worker }, { data: attendance }, { data: advances }] = await Promise.all([
    supabase
      .from('work_plan_members')
      .select('*, profiles(username)')
      .eq('plan_id', planId)
      .eq('user_id', workerId)
      .single(),
    supabase
      .from('attendance')
      .select('*')
      .eq('plan_id', planId)
      .eq('worker_id', workerId)
      .order('date', { ascending: false }),
    supabase
      .from('advances')
      .select('*')
      .eq('plan_id', planId)
      .eq('worker_id', workerId)
      .order('date', { ascending: false }),
  ])

  if (!worker) return <div>İşçi bulunamadı.</div>

  const baseWage = Number(worker.base_daily_wage || 0)
  
  const totalWages = attendance?.reduce((sum, r) => {
    return sum + (r.status === 'present' ? baseWage : 0)
  }, 0) || 0

  const totalConcrete = attendance?.reduce((sum, r) => sum + Number(r.concrete_bonus || 0), 0) || 0
  const totalAks = attendance?.reduce((sum, r) => sum + Number(r.aks_bonus || 0), 0) || 0
  const totalAdvances = advances?.reduce((sum, r) => sum + Number(r.amount || 0), 0) || 0
  const netBalance = (totalWages + totalConcrete + totalAks) - totalAdvances

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href={`/admin/${planId}/payments`} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all text-gray-500">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{worker.full_name}</h2>
            <p className="text-gray-500 font-medium">@{worker.profiles?.username} - Personel Kartı</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-indigo-600 p-4 rounded-3xl text-white shadow-lg">
            <p className="text-[10px] font-black uppercase opacity-60">Net Alacak</p>
            <p className="text-xl font-black">₺{netBalance.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-orange-500 p-4 rounded-3xl text-white shadow-lg">
            <p className="text-[10px] font-black uppercase opacity-60">Ek Mesai</p>
            <p className="text-xl font-black">₺{(totalConcrete + totalAks).toLocaleString('tr-TR')}</p>
          </div>
        </div>
      </div>

      {/* Yoklama Takvimi */}
      <div>
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-3 mb-4">
          <Calendar size={18} className="text-indigo-600" />
          Yoklama Takvimi
        </h3>
        <WorkerCalendar attendance={(attendance ?? []).map(r => ({
          date: r.date,
          status: r.status,
          concrete_bonus: r.concrete_bonus,
          aks_bonus: r.aks_bonus,
        }))} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Puantaj Geçmişi */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-2 flex items-center gap-3">
            <History size={18} className="text-indigo-600" />
            Çalışma & Puantaj Geçmişi
          </h3>
          <div className="space-y-3">
            {attendance?.map((record) => {
              const dayWage = record.status === 'present' ? baseWage : 0
              const concreteBonus = Number(record.concrete_bonus || 0)
              const aksBonus = Number(record.aks_bonus || 0)
              const totalDay = dayWage + concreteBonus + aksBonus

              return (
                <div key={record.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' })}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {record.status === 'present' ? 'Tam Gün' : 'Gelmedi'}
                        </p>
                        {record.is_concrete && (
                          <span className="flex items-center gap-1 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">
                            <HardHat size={10} /> Beton
                          </span>
                        )}
                        {record.is_aks && (
                          <span className="flex items-center gap-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter">
                            Aks
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600">₺{totalDay.toLocaleString('tr-TR')}</p>
                    {concreteBonus > 0 && (
                      <p className="text-[9px] font-bold text-orange-500 uppercase tracking-tighter">+₺{concreteBonus} Beton</p>
                    )}
                    {aksBonus > 0 && (
                      <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">+₺{aksBonus} Aks</p>
                    )}
                  </div>
                </div>
              )
            })}
            {(!attendance || attendance.length === 0) && (
              <p className="text-gray-400 italic py-4">Henüz çalışma kaydı bulunmuyor.</p>
            )}
          </div>
        </div>

        {/* Avans Geçmişi */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Banknote className="text-red-600" />
            Ödeme & Avans Geçmişi
          </h3>
          <div className="space-y-3">
            {advances?.map((adv) => (
              <div key={adv.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {new Date(adv.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs font-medium text-gray-400 uppercase">{adv.description || 'Nakit Avans'}</p>
                </div>
                <p className="text-xl font-black text-red-600">
                  -₺{Number(adv.amount).toLocaleString('tr-TR')}
                </p>
              </div>
            ))}
            {(!advances || advances.length === 0) && (
              <p className="text-gray-400 italic py-4">Henüz avans kaydı bulunmuyor.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
