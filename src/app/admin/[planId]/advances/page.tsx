export default async function AdvancesPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  const { data: advances } = await supabase
    .from('advances')
    .select('*, work_plan_members!advances_worker_id_fkey(full_name)')
    .eq('plan_id', planId)
    .order('date', { ascending: false })

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Avans Kayıtları</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">İşçilere verilen nakit ödemeleri kaydedin.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-red-50 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-2xl font-black mb-6 text-gray-900 dark:text-white">Yeni Avans Ekle</h3>
        <form action={addAdvance} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input type="hidden" name="plan_id" value={planId} />
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase ml-2">İşçi Seçin</label>
            <select name="worker_id" required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all text-lg font-bold">
              <option value="">Seçiniz...</option>
              {workers?.map(w => (
                <option key={w.user_id} value={w.user_id}>{w.full_name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase ml-2">Miktar (₺)</label>
            <input name="amount" type="number" required placeholder="0.00" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all text-lg font-bold" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500 uppercase ml-2">Tarih</label>
            <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all text-lg font-bold" />
          </div>

          <div className="space-y-2 lg:col-span-3">
            <label className="text-sm font-bold text-gray-500 uppercase ml-2">Açıklama</label>
            <input name="description" placeholder="Nakit avans, kira vb." className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-red-500 focus:bg-white outline-none transition-all text-lg font-bold" />
          </div>

          <button type="submit" className="lg:col-start-4 bg-red-600 hover:bg-red-500 text-white font-black py-4 px-8 rounded-2xl text-lg shadow-lg shadow-red-600/20 active:scale-95 transition-all self-end">
            Avansı Kaydet
          </button>
        </form>
      </div>

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
              {advances?.map(adv => (
                <tr key={adv.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-all">
                  <td className="px-8 py-6 text-lg font-bold text-gray-500">{new Date(adv.date).toLocaleDateString('tr-TR')}</td>
                  <td className="px-8 py-6 text-xl font-bold text-gray-900 dark:text-white">{(adv as any).work_plan_members?.full_name}</td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-2xl font-black text-red-600 dark:text-red-400">₺{adv.amount.toLocaleString('tr-TR')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
