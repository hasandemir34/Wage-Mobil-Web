import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createWorker, updateWorker } from './actions'

export default async function WorkersPage() {
  const supabase = await createClient()

  const { data: workers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">İşçi Yönetimi</h2>
          <p className="text-gray-500 dark:text-gray-400">İşçilerin bilgilerini ve günlük yevmiyelerini buradan güncelleyebilirsiniz.</p>
        </div>
      </div>

      {/* Yeni İşçi Ekleme Formu */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Yeni İşçi Kaydı</h3>
        <form action={createWorker} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tam Adı</label>
            <input name="full_name" required placeholder="Ahmet Yılmaz" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-posta</label>
            <input name="email" type="email" required placeholder="isçi@email.com" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Şifre</label>
            <input name="password" type="password" required placeholder="••••••••" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Günlük Yevmiye (₺)</label>
            <input name="base_wage" type="number" required placeholder="0" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <button type="submit" className="md:col-start-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            İşçiyi Kaydet
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 font-medium">İşçi Adı</th>
                <th className="px-6 py-4 font-medium">Günlük Yevmiye (₺)</th>
                <th className="px-6 py-4 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {workers?.map(worker => (
                <tr key={worker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <form action={updateWorker} id={`form-${worker.id}`} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={worker.id} />
                      <input 
                        name="full_name" 
                        defaultValue={worker.full_name}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white w-full max-w-xs"
                      />
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      form={`form-${worker.id}`}
                      name="base_wage" 
                      type="number"
                      defaultValue={worker.base_wage}
                      className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      form={`form-${worker.id}`}
                      type="submit"
                      className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Güncelle
                    </button>
                  </td>
                </tr>
              ))}
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
