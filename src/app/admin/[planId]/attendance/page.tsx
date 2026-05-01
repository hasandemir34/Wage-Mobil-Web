import { createClient } from '@/utils/supabase/server'
import AttendanceManager from './AttendanceManager'

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

  // Bugünün tarihini varsayılan yap
  const currentDate = date || new Date().toISOString().split('T')[0]

  // Bu plandaki işçileri çek
  const { data: workers } = await supabase
    .from('work_plan_members')
    .select('*, profiles(username)')
    .eq('plan_id', planId)
    .eq('role', 'worker')

  // Seçilen tarihin yoklamasını çek
  const { data: attendanceRecords } = await supabase
    .from('attendance')
    .select('worker_id, status')
    .eq('plan_id', planId)
    .eq('date', currentDate)

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col gap-2 px-2">
        <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Günlük Puantaj</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 font-medium italic">
          İşçilerin çalışma durumlarını tarih bazlı kaydedin.
        </p>
      </div>

      <AttendanceManager 
        workers={workers || []} 
        initialAttendance={attendanceRecords || []}
        planId={planId}
        currentDate={currentDate}
      />
    </div>
  )
}
