'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAttendance(formData: FormData) {
  const supabase = await createClient()
  
  const plan_id = formData.get('plan_id') as string
  const worker_id = formData.get('worker_id') as string
  const status = formData.get('status') as string
  const rawDate = formData.get('date') as string
  const date = rawDate ? new Date(rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  
  const overtime_hours = parseFloat(formData.get('overtime_hours') as string) || 0
  const multiplier = parseFloat(formData.get('multiplier') as string) || 1.5

  // Upsert logic: Eğer aynı gün için kayıt varsa güncelle, yoksa ekle
  const { error } = await supabase
    .from('attendance')
    .upsert({ 
      plan_id, 
      worker_id, 
      date, 
      status, 
      overtime_hours, 
      multiplier 
    }, { 
      onConflict: 'plan_id,worker_id,date' 
    })

  if (error) {
    console.error('Attendance Save Error:', error)
    throw error
  }

  revalidatePath(`/admin/${plan_id}/attendance`)
}
