import { createClient } from '@/utils/supabase/server'
import { HardHat, Banknote, Ruler } from 'lucide-react'
import ReportHeader from './ReportHeader'

export default async function ReportPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ planId: string }>,
  searchParams: Promise<{ range?: string }>
}) {
  const { planId } = await params
  const { range } = await searchParams
  const supabase = await createClient()

  // Proje bilgilerini çek
  const { data: plan } = await supabase.from('work_plans').select('*').eq('id', planId).single()
  
  // İşçileri çek
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Tarih aralığını belirle (Türkiye Saati ile)
  let startDate = new Date()
  if (range === '1') startDate.setMonth(startDate.getMonth() - 1)
  else if (range === '3') startDate.setMonth(startDate.getMonth() - 3)
  else startDate = new Date(0) // Tüm geçmiş

  const startDateStr = startDate.toISOString().split('T')[0]

  // Puantajları çek
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('plan_id', planId)
    .gte('date', startDateStr)
    .order('date', { ascending: true })

  // Avansları çek
  const { data: advances } = await supabase
    .from('advances')
    .select('*')
    .eq('plan_id', planId)
    .gte('date', startDateStr)
    .order('date', { ascending: true })

  return (
    <div className="bg-white min-h-screen p-8 print:p-0">
      {/* Yazdırma Kontrol Paneli (Client Component) */}
      <ReportHeader planId={planId} />

      {/* Rapor İçeriği */}
      <div className="max-w-5xl mx-auto border-2 border-gray-100 p-12 rounded-[3rem] print:border-none print:p-0 bg-white shadow-sm">
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
          </div>
        </div>

        {/* İşçi Bazlı Özet Tablo */}
        <div className="mb-16">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
             HAKEDİŞ VE ÖDEME ÖZETİ
          </h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="p-4 text-xs font-black uppercase tracking-widest">İşçi Adı</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-center">Çalışılan Gün</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-right">Yevmiye Toplam</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-right">Beton Toplam</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-right">Avans/Ödenen</th>
                <th className="p-4 text-xs font-black uppercase tracking-widest text-right">Kalan Alacak</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {workers?.map(worker => {
                const wAtt = attendance?.filter(a => a.worker_id === worker.user_id) || []
                const wAdv = advances?.filter(a => a.worker_id === worker.user_id) || []
                
                const fullDays = wAtt.filter(a => a.status === 'present').length
                const halfDays = wAtt.filter(a => a.status === 'half_day').length
                const baseWage = Number(worker.base_daily_wage || 0)
                
                const earnedWages = (fullDays * baseWage) + (halfDays * baseWage / 2)
                const earnedConcrete = wAtt.reduce((sum, a) => sum + Number(a.concrete_bonus || 0), 0)
                const earnedAks = wAtt.reduce((sum, a) => sum + Number(a.aks_bonus || 0), 0)
                const paidTotal = wAdv.reduce((sum, a) => sum + Number(a.amount || 0), 0)
                const balance = (earnedWages + earnedConcrete + earnedAks) - paidTotal

                return (
                  <tr key={worker.user_id} className="font-bold text-gray-800">
                    <td className="p-4 text-lg">{worker.full_name}</td>
                    <td className="p-4 text-center">{fullDays + halfDays}</td>
                    <td className="p-4 text-right">₺{earnedWages.toLocaleString('tr-TR')}</td>
                    <td className="p-4 text-right">₺{earnedConcrete.toLocaleString('tr-TR')}</td>
                    <td className="p-4 text-right">₺{earnedAks.toLocaleString('tr-TR')}</td>
                    <td className="p-4 text-right text-red-600">₺{paidTotal.toLocaleString('tr-TR')}</td>
                    <td className="p-4 text-right text-indigo-600 font-black">₺{balance.toLocaleString('tr-TR')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detaylı İşlem Geçmişi */}
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <HardHat size={14} className="text-orange-500" /> Son Beton Detayları
            </h3>
            <div className="space-y-2">
              {attendance?.filter(a => a.is_concrete).slice(-8).map(a => {
                const w = workers?.find(work => work.user_id === a.worker_id)
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
              {attendance?.filter(a => a.is_aks).slice(-8).map(a => {
                const w = workers?.find(work => work.user_id === a.worker_id)
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
              {advances?.slice(-8).map(a => {
                const w = workers?.find(work => work.user_id === a.worker_id)
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
