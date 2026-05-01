import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createInvitation } from '@/app/actions/invitations'
import { updateWorker } from './actions'
import { UserPlus, Copy, Check, Users } from 'lucide-react'
import CopyInviteButton from './CopyInviteButton'

export default async function WorkersPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  // Aktif işçiler
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Bekleyen davetiyeler
  const { data: invitations } = await supabase
    .from('invitations')
    .select('*')
    .eq('plan_id', planId)
    .eq('status', 'pending')

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">İşçiler & Davetler</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">Yeni işçi ekleyin veya mevcut kadroyu yönetin.</p>
      </div>

      {/* Davetiye Oluşturma Formu */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-indigo-50 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-2xl font-black mb-6 text-gray-900 dark:text-white flex items-center gap-3">
          <UserPlus className="text-indigo-600" />
          Yeni İşçi Ekle
        </h3>
        <form action={createInvitation} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input type="hidden" name="plan_id" value={planId} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase ml-1">İşçi Adı Soyadı</label>
            <input 
              name="worker_name" 
              required 
              placeholder="Örn: Mehmet Usta" 
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-lg font-bold" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase ml-1">Günlük Yevmiye (₺)</label>
            <input 
              name="base_daily_wage" 
              type="number" 
              required 
              placeholder="0" 
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-lg font-bold" 
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-xl text-lg shadow-lg shadow-indigo-600/20 active:scale-95 transition-all self-end">
            Davetiye Oluştur
          </button>
        </form>
      </div>

      {/* Bekleyen Davetiyeler */}
      {invitations && invitations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-orange-500 uppercase tracking-widest px-4">Bekleyen Davetler (WhatsApp ile Gönder)</h3>
          <div className="grid gap-4">
            {invitations.map(inv => (
              <div key={inv.id} className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-3xl border-2 border-orange-100 dark:border-orange-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl shadow-sm text-orange-500">
                    <UserPlus />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{inv.worker_name}</p>
                    <p className="text-sm font-bold text-orange-600 uppercase">₺{inv.base_daily_wage} Yevmiye</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl border-2 border-orange-200 flex-1 sm:flex-none font-mono text-xs truncate max-w-[200px]">
                    {`.../invite/${inv.token}`}
                  </div>
                  <CopyInviteButton token={inv.token} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aktif İşçi Listesi */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-indigo-500 uppercase tracking-widest px-4">Aktif Kadro</h3>
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">İşçi</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">Yevmiye</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {workers?.map(worker => (
                  <tr key={worker.id} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
                    <td className="px-8 py-6 text-xl font-bold text-gray-900 dark:text-white">
                      {worker.full_name}
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">₺{worker.base_daily_wage}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="text-gray-300 hover:text-indigo-600 transition-colors">
                        <Check size={32} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

