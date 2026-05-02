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
  
  if (amount <= 0 || amount > 10000000) {
    throw new Error('Geçersiz avans tutarı.')
  }
  
  const rawDescription = formData.get('description') as string
  const description = rawDescription ? rawDescription.trim().substring(0, 200) : ''

  // Yetki Kontrolü
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum süreniz dolmuş.')

  const { data: membership } = await supabase
    .from('work_plan_members')
    .select('role')
    .eq('plan_id', plan_id)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    throw new Error('Güvenlik ihlali: Bu işlem için yetkiniz yok.')
  }

  const { error } = await supabase
    .from('advances')
    .insert([{ plan_id, worker_id, amount, date, description }])

  if (!error) {
    revalidatePath(`/admin/${plan_id}/advances`, 'page')
  }
}
