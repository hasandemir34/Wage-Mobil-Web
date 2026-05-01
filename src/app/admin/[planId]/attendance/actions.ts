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

  // Önce kaydı kontrol et
  const { data: existing } = await supabase
    .from('attendance')
    .select('id')
    .eq('plan_id', plan_id)
    .eq('worker_id', worker_id)
    .eq('date', date)
    .single()

  if (existing) {
    await supabase
      .from('attendance')
      .update({ status, overtime_hours, multiplier })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('attendance')
      .insert([{ plan_id, worker_id, date, status, overtime_hours, multiplier }])
  }

  revalidatePath(`/admin/${plan_id}/attendance`)
}
