import { createClient } from '@/utils/supabase/server'
import { ArrowLeft, Calendar, History, Banknote, User } from 'lucide-react'
import Link from 'next/link'

export default async function WorkerDetailPage({ 
  params 
}: { 
  params: Promise<{ planId: string, workerId: string }> 
}) {
  const { planId, workerId } = await params
  const supabase = await createClient()

  // 1. İşçi bilgilerini çek
  const { data: worker } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('user_id', workerId)
    .single()

  // 2. Yoklama geçmişini çek
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('plan_id', planId)
    .eq('worker_id', workerId)
    .order('date', { ascending: false })

  // 3. Avans geçmişini çek
  const { data: advances } = await supabase
    .from('advances')
    .select('*')
    .eq('plan_id', planId)
    .eq('worker_id', workerId)
    .order('date', { ascending: false })

  if (!worker) return <div>İşçi bulunamadı.</div>

  const baseWage = Number(worker.base_daily_wage || 0)

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/${planId}/payments`} className="p-3 bg-white rounded-2xl shadow-sm hover:bg-gray-50 transition-all text-gray-500">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{worker.full_name}</h2>
          <p className="text-gray-500 font-medium">@{worker.profiles?.username} - Detaylı Çalışma Geçmişi</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Yoklama Geçmişi */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <History className="text-indigo-600" />
            Çalışma Geçmişi
          </h3>
          <div className="space-y-3">
            {attendance?.map((record) => (
              <div key={record.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'half_day' ? 'bg-orange-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                    </p>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      {record.status === 'present' ? 'Tam Gün' : record.status === 'half_day' ? 'Yarım Gün' : 'Gelmedi'}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-black text-indigo-600">
                  ₺{record.status === 'present' ? baseWage : record.status === 'half_day' ? baseWage / 2 : 0}
                </p>
              </div>
            ))}
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
