import { createClient } from '@/utils/supabase/server'
import AttendanceManager from './AttendanceManager'
import ConcreteManager from './ConcreteManager'
import AksManager from './AksManager'
import AttendanceDateSelector from './AttendanceDateSelector'

export default async function AttendancePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ planId: string }>,
  searchParams: Promise<{ date?: string }>
}) {
  const { planId } = await params
  const { date } = await searchParams
  const supabase = await createClient()

  // Seçili tarihi veya bugünü al (Türkiye Saati)
  const turkeyToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
  const selectedDate = date || turkeyToday

  // İşçileri çek
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Bugünün (Türkiye) verilerini çek (Beton ve Aks her zaman bugün için)
  const { data: todayAttendance } = await supabase
    .from('attendance')
    .select('worker_id, status, is_concrete, concrete_bonus, is_aks, aks_bonus')
    .eq('plan_id', planId)
    .eq('date', turkeyToday)

  // Seçili tarihin (Puantaj için) verilerini çek
  const { data: selectedAttendance } = await supabase
    .from('attendance')
    .select('worker_id, status')
    .eq('plan_id', planId)
    .eq('date', selectedDate)

  const concreteSelected = todayAttendance?.filter(a => a.is_concrete).map(a => a.worker_id) || []
  const aksSelected = todayAttendance?.filter(a => a.is_aks).map(a => a.worker_id) || []
  
  const concreteBonus = todayAttendance?.find(a => a.is_concrete)?.concrete_bonus || 500
  const aksBonus = todayAttendance?.find(a => a.is_aks)?.aks_bonus || 300

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Günlük Puantaj</h2>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
           Bugün: <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{new Date(turkeyToday).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}</span>
        </p>
      </div>

      {/* 1. PUANTAJ ÇİZELGESİ (Tarih Seçilebilir Bölüm) */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Puantaj Çizelgesİ</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              Kayıt Tarihi: <span className="text-indigo-600">{new Date(selectedDate).toLocaleDateString('tr-TR')}</span>
            </p>
          </div>
          
          <AttendanceDateSelector 
            planId={planId} 
            selectedDate={selectedDate} 
            maxDate={turkeyToday} 
          />
        </div>

        <AttendanceManager 
          workers={workers || []} 
          initialAttendance={selectedAttendance || []}
          planId={planId}
          currentDate={selectedDate}
        />
      </div>

      {/* 2. EK MESAİLER (Beton & Aks - Her Zaman Bugün İçin) */}
      <div className="pt-10 border-t-4 border-gray-100 dark:border-gray-800 space-y-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase">Ek Mesaİ Yönetİmİ</h3>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
            Sadece Bugün İçin Eklemeler Yapılır
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConcreteManager 
            planId={planId} 
            workers={workers || []} 
            date={turkeyToday}
            initialSelected={concreteSelected}
            initialBonus={Number(concreteBonus)}
          />
          <AksManager 
            planId={planId} 
            workers={workers || []} 
            date={turkeyToday}
            initialSelected={aksSelected}
            initialBonus={Number(aksBonus)}
          />
        </div>
      </div>
    </div>
  )
}
