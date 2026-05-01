'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAdvance(formData: FormData) {
  const supabase = await createClient()
  
  const plan_id = formData.get('plan_id') as string
  const worker_id = formData.get('worker_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  
  const rawDate = formData.get('date') as string
  const trDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
  const date = rawDate || trDate
  
  if (date > trDate) {
    throw new Error('Gelecek bir tarih için avans girişi yapılamaz.')
  }
  
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('advances')
    .insert([{ plan_id, worker_id, amount, date, description }])

  if (!error) {
    revalidatePath(`/admin/${plan_id}/advances`, 'page')
  }
}
