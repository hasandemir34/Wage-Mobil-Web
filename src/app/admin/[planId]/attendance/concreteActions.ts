'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveConcreteAttendance(
  planId: string, 
  workerIds: string[], 
  bonus: number, 
  date: string
) {
  const supabase = await createClient()

  // Önce o günkü mevcut beton kayıtlarını temizle
  await supabase
    .from('attendance')
    .update({ is_concrete: false, concrete_bonus: 0 })
    .eq('plan_id', planId)
    .eq('date', date)

  if (workerIds.length > 0) {
    for (const workerId of workerIds) {
      // Kayıt var mı kontrol et
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('plan_id', planId)
        .eq('worker_id', workerId)
        .eq('date', date)
        .single()

      if (existing) {
        await supabase
          .from('attendance')
          .update({ is_concrete: true, concrete_bonus: bonus })
          .eq('id', existing.id)
      } else {
        // Kayıt yoksa 'present' olarak oluştur ve beton'u işaretle
        await supabase
          .from('attendance')
          .insert([{
            plan_id: planId,
            worker_id: workerId,
            date: date,
            status: 'present',
            is_concrete: true,
            concrete_bonus: bonus
          }])
      }
    }
  }

  revalidatePath(`/admin/${planId}/attendance`)
}
