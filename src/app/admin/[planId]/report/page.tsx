import { createClient } from '@/utils/supabase/server'
import { HardHat, Banknote, Ruler } from 'lucide-react'
import ReportHeader from './ReportHeader'

export default async function ReportPage({
  params,
  searchParams
}: {
  params: Promise<{ planId: string }>,
  searchParams: Promise<{ range?: string; workers?: string }>
}) {
  const { planId } = await params
  const { range, workers: workersParam } = await searchParams
  const selectedWorkerIds = workersParam ? workersParam.split(',').filter(Boolean) : null
  const supabase = await createClient()

  // Tarih aralığını belirle (Türkiye Saati ile)
  let startDate = new Date()
  if (range === '1') startDate.setMonth(startDate.getMonth() - 1)
  else if (range === '3') startDate.setMonth(startDate.getMonth() - 3)
  else startDate = new Date(0) // Tüm geçmiş

  const startDateStr = startDate.toISOString().split('T')[0]

  const baseWorkersQuery = supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
  const workersQuery = selectedWorkerIds ? baseWorkersQuery.in('user_id', selectedWorkerIds) : baseWorkersQuery

  const [{ data: plan }, { data: workers }, { data: attendance }, { data: advances }] = await Promise.all([
    supabase.from('work_plans').select('*').eq('id', planId).single(),
    workersQuery,
    supabase
      .from('attendance')
      .select('*')
      .eq('plan_id', planId)
      .gte('date', startDateStr)
      .order('date', { ascending: true }),
    supabase
      .from('advances')
      .select('*')
      .eq('plan_id', planId)
      .gte('date', startDateStr)
      .order('date', { ascending: true }),
  ])

  const workersList = workers || []
  const attendanceList = attendance || []
  const advancesList = advances || []
  const attendanceByWorker = new Map<string, any[]>()
  const advancesByWorker = new Map<string, any[]>()

  attendanceList.forEach((item) => {
    const workerArray = attendanceByWorker.get(item.worker_id) ?? []
    workerArray.push(item)
    attendanceByWorker.set(item.worker_id, workerArray)
  })

  advancesList.forEach((item) => {
    const advanceArray = advancesByWorker.get(item.worker_id) ?? []
    advanceArray.push(item)
    advancesByWorker.set(item.worker_id, advanceArray)
  })

  const workerById = new Map(workersList.map((worker: any) => [worker.user_id, worker]))

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 print:p-0">
      {/* Yazdırma Kontrol Paneli (Client Component) */}
      <ReportHeader planId={planId} />

      {/* Rapor İçeriği */}
      <div className="max-w-5xl mx-auto border-2 border-gray-100 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] print:border-none print:p-0 bg-white shadow-sm">
        {/* Antet / Başlık */}
        <div className="flex justify-between items-start border-b-4 border-gray-900 pb-8 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-gray-900">YEVMİYE RAPORU</h1>
            <p className="text-xl font-bold text-indigo-600 uppercase mt-1">{plan?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Rapor Tarihi</p>
            <p className="text-lg font-bold">{new Date().toLocaleDateString('tr-TR')}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase mt-1">Aralık: {range === 'all' ? 'Tüm Geçmiş' : `Son ${range} Ay`}</p>
            {selectedWorkerIds && <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">{selectedWorkerIds.length} İşçi Seçili</p>}
          </div>
        </div>

        {/* İşçi Bazlı Özet Tablo */}
        <div className="mb-16">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
             HAKEDİŞ VE ÖDEME ÖZETİ
          </h2>
          <div className="w-full overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[800px] border border-gray-300">
              <thead>
                <tr className="bg-white text-gray-900 border-b-2 border-gray-900">
                  <th className="p-4 text-xs font-black uppercase tracking-widest border border-gray-300">İşçi Adı</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-center border border-gray-300">Çalışılan Gün</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-center border border-gray-300">Toplam Beton</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-center border border-gray-300">Toplam Aks</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-right text-indigo-600 border border-gray-300">Toplam Hakedİş</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-right text-red-600 border border-gray-300">Çekİlen Avans</th>
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-right text-green-600 border border-gray-300">Kalan Alacak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {workersList.map(worker => {
                  const wAtt = attendanceByWorker.get(worker.user_id) || []
                  const wAdv = advancesByWorker.get(worker.user_id) || []
                  
                  const fullDays = wAtt.filter(a => a.status === 'present').length
                  const baseWage = Number(worker.base_daily_wage || 0)

                  const concreteCount = wAtt.filter(a => a.is_concrete).length
                  const aksCount = wAtt.filter(a => a.is_aks).length

                  const earnedWages = fullDays * baseWage
                  const earnedConcrete = wAtt.reduce((sum, a) => sum + Number(a.concrete_bonus || 0), 0)
                  const earnedAks = wAtt.reduce((sum, a) => sum + Number(a.aks_bonus || 0), 0)
                  const totalEarned = earnedWages + earnedConcrete + earnedAks
                  const paidTotal = wAdv.reduce((sum, a) => sum + Number(a.amount || 0), 0)
                  const balance = totalEarned - paidTotal

                  return (
                    <tr key={worker.user_id} className="font-bold text-gray-800 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-lg border border-gray-300 bg-white">{worker.full_name}</td>
                      <td className="p-4 text-center border border-gray-300 bg-white">{fullDays}</td>
                      <td className="p-4 text-center border border-gray-300 bg-white">
                        <div className="flex flex-col text-xs">
                          <span className="text-orange-600">{concreteCount} Kez</span>
                          <span className="font-black">₺{earnedConcrete.toLocaleString('tr-TR')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center border border-gray-300 bg-white">
                        <div className="flex flex-col text-xs">
                          <span className="text-blue-600">{aksCount} Kez</span>
                          <span className="font-black">₺{earnedAks.toLocaleString('tr-TR')}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-indigo-600 border border-gray-300 bg-white">₺{totalEarned.toLocaleString('tr-TR')}</td>
                      <td className="p-4 text-right text-red-600 font-bold border border-gray-300 bg-white">₺{paidTotal.toLocaleString('tr-TR')}</td>
                      <td className="p-4 text-right bg-white font-black text-green-600 border border-gray-300">₺{balance.toLocaleString('tr-TR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detaylı İşlem Geçmişi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HardHat size={14} className="text-orange-500" /> Son Beton Detayları
            </h3>
            <div className="space-y-2">
              {attendanceList.filter(a => a.is_concrete).slice(-8).map(a => {
                const w = workerById.get(a.worker_id)
                return (
                  <div key={a.id} className="flex justify-between text-[10px] border-b border-gray-50 pb-1">
                    <span className="text-gray-500">{new Date(a.date).toLocaleDateString('tr-TR')} - {w?.full_name}</span>
                    <span className="font-bold text-orange-600">+₺{a.concrete_bonus}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Ruler size={14} className="text-blue-500" /> Son Aks Detayları
            </h3>
            <div className="space-y-2">
              {attendanceList.filter(a => a.is_aks).slice(-8).map(a => {
                const w = workerById.get(a.worker_id)
                return (
                  <div key={a.id} className="flex justify-between text-[10px] border-b border-gray-50 pb-1">
                    <span className="text-gray-500">{new Date(a.date).toLocaleDateString('tr-TR')} - {w?.full_name}</span>
                    <span className="font-bold text-blue-600">+₺{a.aks_bonus}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Banknote size={14} className="text-red-600" /> Son Avanslar
            </h3>
            <div className="space-y-2">
              {advancesList.slice(-8).map(a => {
                const w = workerById.get(a.worker_id)
                return (
                  <div key={a.id} className="flex justify-between text-[10px] border-b border-gray-50 pb-1">
                    <span className="text-gray-500">{new Date(a.date).toLocaleDateString('tr-TR')} - {w?.full_name}</span>
                    <span className="font-bold text-red-600">-₺{a.amount}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-end italic text-gray-400 text-[10px]">
          <div>
            <p>Bu rapor sistem tarafından otomatik oluşturulmuştur.</p>
            <p>Yevmi Mobil Web Uygulaması - {new Date().getFullYear()}</p>
          </div>
          <div className="text-right">
            <div className="w-32 h-px bg-gray-300 mb-2 mx-auto"></div>
            <p className="uppercase font-black text-gray-900 not-italic">ONAY / İMZA</p>
          </div>
        </div>
      </div>
    </div>
  )
}
