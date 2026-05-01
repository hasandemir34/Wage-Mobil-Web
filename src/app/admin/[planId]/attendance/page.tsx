import { createClient } from '@/utils/supabase/server'
import AttendanceManager from './AttendanceManager'
import ConcreteManager from './ConcreteManager'

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

  // Bugünün tarihini varsayılan yap (TR Saati)
  const currentDate = date || new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })

  // Bu plandaki işçileri çek
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Seçilen tarihin puantajını çek (Beton kolonları dahil)
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('worker_id, status, is_concrete, concrete_bonus')
    .eq('plan_id', planId)
    .eq('date', currentDate)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2 px-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase">Günlük Puantaj</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">
          İşçilerin çalışma durumlarını ve beton mesailerini kaydedin.
        </p>
      </div>

      {/* Beton Mesaisi Kartı */}
      <ConcreteManager 
        workers={workers || []}
        attendanceRecords={attendanceRecords || []}
        planId={planId}
        date={currentDate}
      />

      <AttendanceManager 
        workers={workers || []} 
        initialAttendance={attendanceRecords || []}
        planId={planId}
        currentDate={currentDate}
      />
    </div>
  )
}
