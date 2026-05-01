import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { saveAttendance } from './actions'

export default async function AttendancePage() {
  const supabase = await createClient()

  // Get all workers
  const { data: workers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')

  // Get today's attendance
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('date', today)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Günlük Yevmiye & Mesai Girişi</h2>
        <p className="text-gray-500 dark:text-gray-400">İşçilerin günlük devam durumunu ve mesailerini buradan girebilirsiniz.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">İşçi Adı</th>
                <th className="px-6 py-4 font-medium">Günlük Yevmiye</th>
                <th className="px-6 py-4 font-medium min-w-[300px]">Bugünkü Durum (Hızlı Giriş)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {workers?.map(worker => {
                const record = todayAttendance?.find(a => a.worker_id === worker.id)
                return (
                  <tr key={worker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {worker.full_name || 'İsimsiz'}
                    </td>
                    <td className="px-6 py-4">
                      ₺{worker.base_wage}
                    </td>
                    <td className="px-6 py-4">
                      <form action={saveAttendance} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input type="hidden" name="worker_id" value={worker.id} />
                        <input type="hidden" name="date" value={today} />
                        
                        <select 
                          name="status" 
                          defaultValue={record?.status || 'present'}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="present">Geldi</option>
                          <option value="absent">Gelmedi</option>
                        </select>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 dark:text-gray-400">Mesai (Saat):</label>
                          <input 
                            type="number" 
                            name="overtime_hours" 
                            defaultValue={record?.overtime_hours || 0}
                            min="0"
                            step="0.5"
                            className="w-16 rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                          />
                        </div>

                        <button 
                          type="submit"
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                          Kaydet
                        </button>

                        {record && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium ml-2">
                            ✓ Kaydedildi
                          </span>
                        )}
                      </form>
                    </td>
                  </tr>
                )
              })}
              {workers?.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Sistemde henüz işçi bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
