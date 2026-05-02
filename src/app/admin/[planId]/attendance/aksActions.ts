'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAksAttendance(
  planId: string, 
  workerIds: string[], 
  bonus: number, 
  date: string
) {
  const supabase = await createClient()

  // Türkiye saatine göre bugünü al
  const turkeyToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })

  if (date > turkeyToday) {
    throw new Error('Gelecek bir tarih için kayıt girişi yapılamaz.')
  }

  if (bonus < 0 || bonus > 1000000) {
    throw new Error('Geçersiz bonus tutarı.')
  }

  // Yetki Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum süreniz dolmuş.')

  const { data: membership } = await supabase
    .from('work_plan_members')
    .select('role')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    throw new Error('Güvenlik ihlali: Bu işlem için yetkiniz yok.')
  }

  // Önce o günkü mevcut aks kayıtlarını temizle (Update mantığı için)
  await supabase
    .from('attendance')
    .update({ is_aks: false, aks_bonus: 0 })
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
          .update({ is_aks: true, aks_bonus: bonus })
          .eq('id', existing.id)
      } else {
        // Kayıt yoksa 'present' olarak oluştur ve aks'ı işaretle
        await supabase
          .from('attendance')
          .insert([{
            plan_id: planId,
            worker_id: workerId,
            date: date,
            status: 'present',
            is_aks: true,
            aks_bonus: bonus
          }])
      }
    }
  }

  revalidatePath(`/admin/${planId}/attendance`)
}
