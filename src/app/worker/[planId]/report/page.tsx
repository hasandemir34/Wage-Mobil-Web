import { createClient } from '@/utils/supabase/server'
import { TrendingUp } from 'lucide-react'
import WorkerReportHeader from './WorkerReportHeader'

export default async function WorkerReportPage({ 
  params 
}: { 
  params: Promise<{ planId: string }> 
}) {
  const { planId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: worker }, { data: attendance }, { data: advances }] = await Promise.all([
    supabase
      .from('work_plan_members')
      .select('*, work_plans(name)')
      .eq('plan_id', planId)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('attendance')
      .select('*')
      .eq('plan_id', planId)
      .eq('worker_id', user.id)
      .order('date', { ascending: true }),
    supabase
      .from('advances')
      .select('*')
      .eq('plan_id', planId)
      .eq('worker_id', user.id)
      .order('date', { ascending: true }),
  ])

  if (!worker) return null

  const baseWage = Number(worker.base_daily_wage || 0)

  // AYLIK GRUPLAMA MANTIĞI
  const monthlyData: { [key: string]: any } = {}

  attendance?.forEach(r => {
    const monthKey = new Date(r.date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { full: 0, concrete: 0, aks: 0, wageEarned: 0, concreteEarned: 0, aksEarned: 0, advances: 0 }
    }
    
    if (r.status === 'present') {
      monthlyData[monthKey].full += 1
      monthlyData[monthKey].wageEarned += baseWage
    }

    if (r.is_concrete) {
      monthlyData[monthKey].concrete += 1
      monthlyData[monthKey].concreteEarned += Number(r.concrete_bonus || 0)
    }

    if (r.is_aks) {
      monthlyData[monthKey].aks += 1
      monthlyData[monthKey].aksEarned += Number(r.aks_bonus || 0)
    }
  })

  advances?.forEach(a => {
    const monthKey = new Date(a.date).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { full: 0, concrete: 0, aks: 0, wageEarned: 0, concreteEarned: 0, aksEarned: 0, advances: 0 }
    }
    monthlyData[monthKey].advances += Number(a.amount || 0)
  })

  const totalEarned = (attendance?.reduce((sum, r) => {
    return sum + (r.status === 'present' ? baseWage : 0) + Number(r.concrete_bonus || 0) + Number(r.aks_bonus || 0)
  }, 0) || 0)
  
  const totalAdvances = advances?.reduce((sum, a) => sum + Number(a.amount), 0) || 0
  const netBalance = totalEarned - totalAdvances

  return (
    <div className="bg-white min-h-screen p-4 sm:p-10 print:p-0">
      <WorkerReportHeader planId={planId} />

      <div className="max-w-4xl mx-auto border-2 border-gray-100 p-4 sm:p-12 rounded-[2rem] sm:rounded-[3rem] print:border-none print:p-0 shadow-sm bg-white">
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-gray-900 leading-none">İŞÇİ HAKEDİŞ RAPORU</h1>
            <p className="text-xl font-bold text-indigo-600 uppercase mt-2">{worker.full_name}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{worker.work_plans.name} Şantiyesi</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rapor Tarihi</p>
            <p className="text-lg font-bold">{new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Genel Toplam Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Toplam Kazanç</p>
            <p className="text-2xl font-black text-indigo-900">₺{totalEarned.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Toplam Alınan</p>
            <p className="text-2xl font-black text-red-600">₺{totalAdvances.toLocaleString('tr-TR')}</p>
          </div>
          <div className="bg-green-600 p-6 rounded-[2rem] text-white shadow-xl shadow-green-600/20">
            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Kalan Alacak</p>
            <p className="text-2xl font-black">₺{netBalance.toLocaleString('tr-TR')}</p>
          </div>
        </div>

        {/* Aylık Özet Tablosu */}
        <div className="space-y-6">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600" /> AYLIK ÇALIŞMA ÖZETİ
          </h2>
          <div className="w-full overflow-x-auto overflow-y-hidden rounded-[2rem] border-2 border-gray-50">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-900 text-white">
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest">Dönem / Ay</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Çalışılan Gün</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-center">Beton</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Hakediş</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Avans</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-right">Net Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(monthlyData).reverse().map(month => {
                  const data = monthlyData[month]
                  const monthlyTotal = (data.wageEarned + data.concreteEarned + data.aksEarned || 0) - data.advances
                  return (
                    <tr key={month} className="text-gray-700 font-bold hover:bg-gray-50 transition-colors">
                      <td className="p-5 text-sm uppercase">{month}</td>
                      <td className="p-5 text-center text-sm">
                        <span className="text-green-600">{data.full} Gün</span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex flex-col items-center justify-center gap-1 text-[10px]">
                          <span className={data.concrete > 0 ? 'text-orange-600' : 'text-gray-300'}>Beton: {data.concrete} Kez</span>
                          <span className={data.aks > 0 ? 'text-blue-600' : 'text-gray-300'}>Aks: {data.aks || 0} Kez</span>
                        </div>
                      </td>
                      <td className="p-5 text-right text-sm">₺{(data.wageEarned + data.concreteEarned + (data.aksEarned || 0)).toLocaleString('tr-TR')}</td>
                      <td className="p-5 text-right text-sm text-red-600">₺{data.advances.toLocaleString('tr-TR')}</td>
                      <td className={`p-5 text-right text-base font-black ${monthlyTotal >= 0 ? 'text-indigo-600' : 'text-red-700'}`}>
                        ₺{monthlyTotal.toLocaleString('tr-TR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-end text-gray-400 text-[10px] italic">
          <div>
            <p>Bu rapor sistem tarafından otomatik olarak aylık bazda özetlenmiştir.</p>
            <p>Yevmi Mobil Web Uygulaması - {new Date().getFullYear()}</p>
          </div>
          <div className="text-right">
            <p className="font-black text-gray-900 not-italic uppercase tracking-widest">Kişisel Arşiv</p>
          </div>
        </div>
      </div>
    </div>
  )
}
