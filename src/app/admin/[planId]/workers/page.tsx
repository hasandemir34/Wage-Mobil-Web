import { createClient } from '@/utils/supabase/server'
import { createInvitation } from '@/app/actions/invitations'
import { UserPlus } from 'lucide-react'
import CopyInviteButton from './CopyInviteButton'
import EditWorkerRow from './EditWorkerRow'

export default async function WorkersPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  // Aktif işçiler
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Bekleyen davetiyeler
  const { data: invitations } = await supabase
    .from('invitations')
    .select('*')
    .eq('plan_id', planId)
    .eq('status', 'pending')

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">İşçiler & Davetler</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">Yeni işçi ekleyin veya mevcut kadronun yevmiyelerini yönetin.</p>
      </div>

      {/* Davetiye Oluşturma Formu */}
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <UserPlus size={20} />
          </div>
          Yeni İşçi Ekle
        </h3>
        <p className="text-sm text-gray-400 font-medium mb-6">İşçi eklenir eklenmez yoklama ve avans takibine başlayabilirsiniz. Davet linkini işçiyle paylaşarak kendi hesabını oluşturmasını sağlayın.</p>
        <form action={createInvitation} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input type="hidden" name="plan_id" value={planId} />
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İşçi Adı Soyadı</label>
            <input
              name="worker_name"
              required
              placeholder="Örn: Mehmet Usta"
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-transparent rounded-2xl placeholder:text-gray-400 focus:border-indigo-600 outline-none transition-all text-lg font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Günlük Yevmiye (₺)</label>
            <input
              name="base_daily_wage"
              type="number"
              required
              placeholder="0"
              className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-transparent rounded-2xl placeholder:text-gray-400 focus:border-indigo-600 outline-none transition-all text-lg font-bold"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-8 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all self-end">
            İşçiyi Ekle
          </button>
        </form>
      </div>

      {/* Aktif İşçi Listesi */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] px-4">Aktif Kadro (Yevmiye Düzenle)</h3>
        <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">İşçi Bilgileri</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Yevmiye</th>
                  <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Düzenle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {workers?.map(worker => (
                  <EditWorkerRow key={worker.id} worker={worker} planId={planId} />
                ))}
                {(!workers || workers.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest">Henüz işçi eklenmedi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hesap Aktivasyonu Bekleyen İşçiler */}
      {invitations && invitations.length > 0 && (
        <div className="space-y-4">
          <div className="px-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Hesap Aktivasyonu Bekleyenler</h3>
            <p className="text-xs text-gray-400 font-medium mt-1">Bu işçiler sisteme eklendi ve takip edilebilir. Linki paylaşarak kendi kullanıcı adı ve şifrelerini belirlemelerini sağlayın.</p>
          </div>
          <div className="grid gap-4">
            {invitations.map(inv => (
              <div key={inv.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] border border-orange-100 dark:border-orange-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl text-orange-500">
                    <UserPlus />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{inv.worker_name}</p>
                    <p className="text-xs font-black text-orange-500 uppercase tracking-widest">₺{inv.base_daily_wage} Yevmiye · Hesap Bekleniyor</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-100 dark:border-gray-600 flex-1 sm:flex-none font-mono text-[10px] truncate max-w-[200px]">
                    {inv.token}
                  </div>
                  <CopyInviteButton token={inv.token} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

