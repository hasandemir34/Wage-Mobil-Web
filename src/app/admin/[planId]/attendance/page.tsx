import { createClient } from '@/utils/supabase/server'
import { saveAttendance } from './actions'
import { Check } from 'lucide-react'

export default async function AttendancePage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  // Bu plandaki işçileri çek
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Bugünün yoklamasını çek
  const today = new Date().toISOString().split('T')[0]
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('plan_id', planId)
    .eq('date', today)

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Günlük Yevmiye</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">İşçilerin bugünkü çalışma durumunu kaydedin.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">İşçi</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider min-w-[400px]">Durum & Mesai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {workers?.map(worker => {
                const record = todayAttendance?.find(a => a.worker_id === worker.user_id)
                return (
                  <tr key={worker.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                    <td className="px-8 py-6">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{worker.full_name}</div>
                      <div className="text-sm font-bold text-gray-400 uppercase">₺{worker.base_daily_wage} Yevmiye</div>
                    </td>
                    <td className="px-8 py-6">
                      <form action={saveAttendance} className="flex flex-wrap items-center gap-4">
                        <input type="hidden" name="plan_id" value={planId} />
                        <input type="hidden" name="worker_id" value={worker.user_id} />
                        <input type="hidden" name="date" value={today} />
                        
                        <select 
                          name="status" 
                          defaultValue={record?.status || 'present'}
                          className="px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-lg font-bold"
                        >
                          <option value="present">Geldİ</option>
                          <option value="absent">Gelmedİ</option>
                        </select>

                        <div className="flex items-center gap-3 bg-white dark:bg-gray-700 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent transition-all">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">Mesai:</label>
                          <input 
                            type="number" 
                            name="overtime_hours" 
                            defaultValue={record?.overtime_hours || 0}
                            min="0"
                            step="0.5"
                            className="w-16 bg-transparent text-xl font-black text-indigo-600 outline-none text-center" 
                          />
                        </div>

                        <button 
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                        >
                          KAYDET
                        </button>

                        {record && (
                          <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
                            <Check size={24} />
                          </div>
                        )}
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
