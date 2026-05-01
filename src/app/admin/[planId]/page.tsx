import { createClient } from '@/utils/supabase/server'
import { Users, WalletCards, Briefcase } from 'lucide-react'

export default async function AdminDashboard({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  const { data: advances } = await supabase
    .from('advances')
    .select('amount')
    .eq('plan_id', planId)
  
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('plan_id', planId)
    .eq('date', today)
    .eq('status', 'present')

  const totalWorkers = workers?.length || 0
  const totalAdvances = advances?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const activeToday = todayAttendance?.length || 0
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Genel Özet</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Bu şantiyedeki güncel durumunuz.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Toplam İşçi */}
        <div className="rounded-[2rem] border-4 border-indigo-50 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 p-8 transform hover:scale-[1.02] transition-all">
          <div className="flex flex-row items-center justify-between pb-6">
            <h3 className="tracking-tight text-xl font-black text-gray-400 uppercase">Toplam İşçi</h3>
            <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
              <Users className="h-8 w-8" />
            </div>
          </div>
          <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400">{totalWorkers}</div>
          <p className="text-lg font-bold text-gray-400 mt-2">Kayıtlı personel</p>
        </div>

        {/* Toplam Avans */}
        <div className="rounded-[2rem] border-4 border-red-50 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 p-8 transform hover:scale-[1.02] transition-all">
          <div className="flex flex-row items-center justify-between pb-6">
            <h3 className="tracking-tight text-xl font-black text-gray-400 uppercase">Toplam Avans</h3>
            <div className="bg-red-100 p-3 rounded-2xl text-red-600">
              <WalletCards className="h-8 w-8" />
            </div>
          </div>
          <div className="text-5xl font-black text-red-600 dark:text-red-400">₺{totalAdvances.toLocaleString('tr-TR')}</div>
          <p className="text-lg font-bold text-gray-400 mt-2">Bu ay dağıtılan</p>
        </div>

        {/* Bugün Çalışan */}
        <div className="rounded-[2rem] border-4 border-green-50 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 p-8 transform hover:scale-[1.02] transition-all">
          <div className="flex flex-row items-center justify-between pb-6">
            <h3 className="tracking-tight text-xl font-black text-gray-400 uppercase">Bugün Çalışan</h3>
            <div className="bg-green-100 p-3 rounded-2xl text-green-600">
              <Briefcase className="h-8 w-8" />
            </div>
          </div>
          <div className="text-6xl font-black text-green-600 dark:text-green-400">{activeToday}</div>
          <p className={`text-lg font-bold mt-2 ${activeToday > 0 ? 'text-green-500' : 'text-orange-500'}`}>
            {activeToday > 0 ? 'Yoklama tamamlandı' : 'Henüz giriş yapılmadı'}
          </p>
        </div>
      </div>
    </div>
  )
}
