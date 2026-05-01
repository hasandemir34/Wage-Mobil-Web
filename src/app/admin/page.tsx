import { createClient } from '@/utils/supabase/server'
import { Users, WalletCards, Briefcase } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: workers } = await supabase.from('profiles').select('*').eq('role', 'worker')
  const { data: advances } = await supabase.from('advances').select('*')
  
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('id')
    .eq('date', today)
    .eq('status', 'present')

  const totalWorkers = workers?.length || 0
  const totalAdvances = advances?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const activeToday = todayAttendance?.length || 0
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Genel Özet</h2>
        <p className="text-gray-500 dark:text-gray-400">Sistemin genel durumunu buradan takip edebilirsiniz.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Toplam İşçi</h3>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalWorkers}</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Verilen Toplam Avans</h3>
            <WalletCards className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₺{totalAdvances.toLocaleString('tr-TR')}</div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500 dark:text-gray-400">Bugün Çalışan</h3>
            <Briefcase className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeToday}</div>
          <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
            {activeToday > 0 ? 'Kayıtlar güncel' : 'Henüz giriş yapılmadı'}
          </p>
        </div>
      </div>
    </div>
  )
}
