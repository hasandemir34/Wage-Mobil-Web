import { createClient } from '@/utils/supabase/server'
import { CalendarDays, Banknote, Clock, Calculator } from 'lucide-react'

export default async function WorkerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Çalışan bilgilerini çekelim
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Devamsızlık ve Mesai bilgisi
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('worker_id', user.id)

  // Avanslar
  const { data: advances } = await supabase
    .from('advances')
    .select('*')
    .eq('worker_id', user.id)

  const baseWage = Number(profile?.base_wage || 0)
  
  // Hesaplamalar
  const totalDaysWorked = attendance?.filter(a => a.status === 'present').length || 0
  const totalAdvances = advances?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  
  let totalOvertimeEarnings = 0
  attendance?.forEach(record => {
    if (record.overtime_hours > 0) {
      // Mesai ücreti: Saatlik ücret (Günlük / 8) * çarpan * saat
      const hourlyRate = baseWage / 8
      const multiplier = Number(record.multiplier) || 1.5
      totalOvertimeEarnings += (hourlyRate * multiplier * Number(record.overtime_hours))
    }
  })

  // Net Bakiye = (Gün * Yevmiye) + Mesai - Avanslar
  const baseEarnings = totalDaysWorked * baseWage
  const netBalance = baseEarnings + totalOvertimeEarnings - totalAdvances

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Merhaba, {profile?.full_name || user.email}</h1>
        <p className="text-gray-500 dark:text-gray-400">Güncel kazanç ve çalışma özetiniz aşağıdadır.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Çalışılan Gün */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Çalışılan Gün</h3>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalDaysWorked} Gün</div>
          <p className="text-xs text-gray-500 mt-1">Yevmiye: ₺{baseWage}</p>
        </div>

        {/* Mesai Kazancı */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Mesai Kazancı</h3>
            <Clock className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">₺{Math.round(totalOvertimeEarnings).toLocaleString('tr-TR')}</div>
        </div>

        {/* Alınan Avans */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Alınan Avans</h3>
            <Banknote className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">-₺{totalAdvances.toLocaleString('tr-TR')}</div>
        </div>

        {/* Kalan Alacak */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-6 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-900/20">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Kalan Alacak</h3>
            <Calculator className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-700 dark:text-indigo-300">
            ₺{Math.round(netBalance).toLocaleString('tr-TR')}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Son Çalışma Günleri</h3>
          {attendance?.length ? (
            <ul className="space-y-3">
              {attendance.slice(0, 5).map(record => (
                <li key={record.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">{new Date(record.date).toLocaleDateString('tr-TR')}</span>
                  <div className="flex flex-col items-end">
                    <span className={`font-medium ${record.status === 'present' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {record.status === 'present' ? 'Geldi' : 'Gelmedi'}
                    </span>
                    {record.overtime_hours > 0 && (
                      <span className="text-xs text-orange-500">+{record.overtime_hours} saat mesai</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Kayıt bulunamadı.</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Son Avanslar</h3>
          {advances?.length ? (
            <ul className="space-y-3">
              {advances.slice(0, 5).map(record => (
                <li key={record.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 dark:border-gray-700">
                  <div className="flex flex-col">
                    <span className="text-gray-600 dark:text-gray-300">{new Date(record.date).toLocaleDateString('tr-TR')}</span>
                    <span className="text-xs text-gray-400">{record.description}</span>
                  </div>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    ₺{record.amount.toLocaleString('tr-TR')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Kayıt bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  )
}
