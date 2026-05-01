'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAdvance(formData: FormData) {
  const supabase = await createClient()
  
  const worker_id = formData.get('worker_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  
  const rawDate = formData.get('date') as string
  const date = rawDate ? new Date(rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  
  const description = formData.get('description') as string

  await supabase
    .from('advances')
    .insert([{ worker_id, amount, date, description }])

  revalidatePath('/admin/advances')
}
