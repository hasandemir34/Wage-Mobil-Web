import { createClient } from '@/utils/supabase/server'
import { Users, WalletCards, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import ReportPanel from './ReportPanel'

export default async function AdminDashboard({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  const { data: advances } = await supabase
    .from('advances')
    .select('amount')
    .eq('plan_id', planId)
  
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('plan_id', planId)
    .eq('date', today)
    .eq('status', 'present')

  // Tüm yoklamaları çek (Hesaplama için)
  const { data: allAttendance } = await supabase
    .from('attendance')
    .select('worker_id, status, concrete_bonus, aks_bonus')
    .eq('plan_id', planId)

  // Toplam hakedişi hesapla
  let totalEarned = 0
  allAttendance?.forEach(att => {
    const worker = workers?.find(w => w.user_id === att.worker_id)
    if (worker) {
      const wage = Number(worker.base_daily_wage || 0)
      if (att.status === 'present') totalEarned += wage
      else if (att.status === 'half_day') totalEarned += (wage / 2)
      
      // Beton ve Aks bonuslarını hakedişe ekle
      totalEarned += Number(att.concrete_bonus || 0)
      totalEarned += Number(att.aks_bonus || 0)
    }
  })

  const totalWorkers = workers?.length || 0
  const totalAdvances = advances?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const activeToday = todayAttendance?.length || 0
  const netBalance = totalEarned - totalAdvances
  
  return (
    <div className="space-y-10 pb-24">
      <div className="flex flex-col gap-2 px-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Proje Özeti</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">Şantiyedeki mali durumu ve puantajları buradan izleyin.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Ödenecek Toplam (Link) */}
        <Link href={`/admin/${planId}/payments`} className="rounded-[2rem] border-4 border-indigo-600 bg-indigo-600 shadow-xl p-8 transform hover:scale-[1.05] hover:shadow-indigo-600/40 transition-all text-white group relative overflow-hidden">
          <div className="flex flex-row items-center justify-between pb-6 relative z-10">
            <h3 className="tracking-tight text-xl font-black opacity-80 uppercase">Ödenecek Toplam</h3>
            <div className="bg-white/20 p-3 rounded-2xl group-hover:scale-110 transition-transform">
              <WalletCards className="h-8 w-8" />
            </div>
          </div>
          <div className="text-4xl font-black tracking-tighter tabular-nums relative z-10">₺{netBalance.toLocaleString('tr-TR')}</div>
          <p className="text-sm font-bold opacity-70 mt-2 relative z-10 flex items-center gap-2">
            Detayları gör <ArrowRight size={16} />
          </p>
        </Link>

        {/* Toplam Avans */}
        <div className="rounded-[2rem] border-4 border-red-50 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 p-8 transform hover:scale-[1.02] transition-all">
          <div className="flex flex-row items-center justify-between pb-6">
            <h3 className="tracking-tight text-xl font-black text-gray-400 uppercase">Toplam Avans</h3>
            <div className="bg-red-100 p-3 rounded-2xl text-red-600">
              <WalletCards className="h-8 w-8" />
            </div>
          </div>
          <div className="text-4xl font-black text-red-600 dark:text-red-400">₺{totalAdvances.toLocaleString('tr-TR')}</div>
          <p className="text-sm font-bold text-gray-400 mt-2">Dağıtılan toplam miktar</p>
        </div>

        {/* Bugün Çalışan */}
        <div className="rounded-[2rem] border-4 border-green-50 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800 p-8 transform hover:scale-[1.02] transition-all">
          <div className="flex flex-row items-center justify-between pb-6">
            <h3 className="tracking-tight text-xl font-black text-gray-400 uppercase">Bugün Çalışan</h3>
            <div className="bg-green-100 p-3 rounded-2xl text-green-600">
              <Briefcase className="h-8 w-8" />
            </div>
          </div>
          <div className="text-5xl font-black text-green-600 dark:text-green-400">{activeToday}</div>
          <p className={`text-sm font-bold mt-2 ${activeToday > 0 ? 'text-green-500' : 'text-orange-500'}`}>
            {activeToday > 0 ? 'Puantaj tamam' : 'Giriş bekleniyor'}
          </p>
        </div>
      </div>

      {/* Doküman Oluşturma Satırı (ALTTA) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ReportPanel planId={planId} />
        </div>
      </div>
    </div>
  )
}
