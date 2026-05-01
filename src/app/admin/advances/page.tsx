import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addAdvance } from './actions'

export default async function AdvancesPage() {
  const supabase = await createClient()

  const { data: workers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')

  const { data: advances } = await supabase
    .from('advances')
    .select('*, profiles(full_name)')
    .order('date', { ascending: false })

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Avans Kayıtları</h2>
        <p className="text-gray-500 dark:text-gray-400">İşçilere verilen avansları buradan kaydedebilir ve geçmişi görebilirsiniz.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Yeni Avans Ekle</h3>
        <form action={addAdvance} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">İşçi Seçin</label>
            <select name="worker_id" required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Seçiniz...</option>
              {workers?.map(w => (
                <option key={w.id} value={w.id}>{w.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Miktar (₺)</label>
            <input name="amount" type="number" required placeholder="0.00" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarih</label>
            <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Açıklama</label>
            <input name="description" placeholder="Nakit avans, kira vb." className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <button type="submit" className="md:col-start-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            Avansı Kaydet
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <h3 className="p-6 pb-0 text-lg font-semibold text-gray-900 dark:text-white">Son İşlemler</h3>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">Tarih</th>
                <th className="px-6 py-4 font-medium">İşçi</th>
                <th className="px-6 py-4 font-medium">Miktar</th>
                <th className="px-6 py-4 font-medium">Açıklama</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {advances?.map(adv => (
                <tr key={adv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">{new Date(adv.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{(adv as any).profiles?.full_name}</td>
                  <td className="px-6 py-4 text-red-600 dark:text-red-400 font-semibold">₺{adv.amount.toLocaleString('tr-TR')}</td>
                  <td className="px-6 py-4">{adv.description}</td>
                </tr>
              ))}
              {advances?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Henüz avans kaydı bulunmuyor.
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
