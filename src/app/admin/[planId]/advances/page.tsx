import { createClient } from '@/utils/supabase/server'
import { addAdvance } from './actions'
import { Banknote } from 'lucide-react'
import AdvanceForm from './AdvanceForm'

export default async function AdvancesPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  const { data: advances } = await supabase
    .from('advances')
    .select('*')
    .eq('plan_id', planId)
    .order('date', { ascending: false })

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Avans Kayıtları</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">İşçilere verilen nakit ödemeleri ve ara ödemeleri kaydedin.</p>
      </div>

      <AdvanceForm planId={planId} workers={workers || []} today={today} />

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        <h3 className="p-8 pb-4 text-xl font-bold text-gray-400 uppercase tracking-widest">Son İşlemler</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">Tarih</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">İşçi</th>
                <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-right">Miktar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {advances?.map(adv => {
                const worker = workers?.find(w => w.user_id === adv.worker_id)
                return (
                  <tr key={adv.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-all">
                    <td className="px-8 py-6 text-lg font-bold text-gray-500">{new Date(adv.date).toLocaleDateString('tr-TR')}</td>
                    <td className="px-8 py-6 text-xl font-bold text-gray-900 dark:text-white">
                      {worker?.full_name || 'Bilinmeyen İşçi'} 
                      <span className="block text-xs text-gray-400 font-semibold">@{(worker as any)?.profiles?.username}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-2xl font-black text-red-600 dark:text-red-400">₺{adv.amount.toLocaleString('tr-TR')}</span>
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
