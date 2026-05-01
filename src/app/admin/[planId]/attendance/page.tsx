import { createClient } from '@/utils/supabase/server'
import AttendanceManager from './AttendanceManager'
import ConcreteManager from './ConcreteManager'
import AksManager from './AksManager'

export default async function AttendancePage({ 
  params,
}: { 
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params
  const supabase = await createClient()

  // Türkiye saatine göre bugünün tarihini al (YYYY-MM-DD)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })

  // İşçileri çek (Kullanıcı adları dahil)
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Bugünün kayıtlarını çek (Beton ve Aks kolonları dahil)
  const { data: attendance } = await supabase
    .from('attendance')
    .select('worker_id, status, is_concrete, concrete_bonus, is_aks, aks_bonus')
    .eq('plan_id', planId)
    .eq('date', today)

  // Seçili işçileri ve primleri önceden hesapla (Hata payını sıfıra indirmek için)
  const concreteSelected = attendance?.filter(a => a.is_concrete).map(a => a.worker_id) || []
  const aksSelected = attendance?.filter(a => a.is_aks).map(a => a.worker_id) || []
  
  const concreteBonus = attendance?.find(a => a.is_concrete)?.concrete_bonus || 500
  const aksBonus = attendance?.find(a => a.is_aks)?.aks_bonus || 300

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Günlük Puantaj</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">
          Bugün: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* Mesai Yönetim Paneli (Beton & Aks) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConcreteManager 
          planId={planId} 
          workers={workers || []} 
          date={today}
          initialSelected={concreteSelected}
          initialBonus={Number(concreteBonus)}
        />
        <AksManager 
          planId={planId} 
          workers={workers || []} 
          date={today}
          initialSelected={aksSelected}
          initialBonus={Number(aksBonus)}
        />
      </div>

      <AttendanceManager 
        workers={workers || []} 
        initialAttendance={attendance || []}
        planId={planId}
        currentDate={today}
      />
    </div>
  )
}
