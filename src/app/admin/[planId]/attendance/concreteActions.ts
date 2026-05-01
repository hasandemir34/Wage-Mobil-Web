'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveConcreteAttendance(formData: FormData) {
  const supabase = await createClient()
  
  const planId = formData.get('plan_id') as string
  const date = formData.get('date') as string
  const concreteWage = parseFloat(formData.get('concrete_wage') as string) || 0
  const selectedWorkers = JSON.parse(formData.get('selected_workers') as string) as string[]

  // Önce o günkü tüm beton işaretlerini kaldır (Sıfırla)
  await supabase
    .from('attendance')
    .update({ is_concrete: false, concrete_bonus: 0 })
    .eq('plan_id', planId)
    .eq('date', date)

  // Seçilen işçileri güncelle
  if (selectedWorkers.length > 0) {
    const { error } = await supabase
      .from('attendance')
      .update({ is_concrete: true, concrete_bonus: concreteWage })
      .eq('plan_id', planId)
      .eq('date', date)
      .in('worker_id', selectedWorkers)

    if (error) {
      // Eğer o gün için henüz yoklama girilmemişse, upsert yapması gerekebilir.
      // Ancak genellikle önce yoklama girilir. Hata almamak için gerekirse kayıt oluşturulabilir.
      console.error('Concrete Save Error:', error)
    }
  }

  revalidatePath(`/admin/${planId}/attendance`)
}
