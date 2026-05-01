import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function WorkersPage() {
  const supabase = await createClient()

  // Get all workers
  const { data: workers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'worker')

  async function updateWorker(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const id = formData.get('id') as string
    const full_name = formData.get('full_name') as string
    const base_wage = parseFloat(formData.get('base_wage') as string) || 0

    await supabase
      .from('profiles')
      .update({ full_name, base_wage })
      .eq('id', id)

    revalidatePath('/admin/workers')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">İşçi Yönetimi</h2>
        <p className="text-gray-500 dark:text-gray-400">İşçilerin bilgilerini ve günlük yevmiyelerini buradan güncelleyebilirsiniz.</p>
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
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
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
