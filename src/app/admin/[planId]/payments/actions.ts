'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function makePayment(formData: FormData) {
  const supabase = await createClient()
  
  const plan_id = formData.get('plan_id') as string
  const worker_id = formData.get('worker_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const max_amount = parseFloat(formData.get('max_amount') as string)
  
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Geçersiz ödeme tutarı.')
  }

  if (amount > max_amount) {
    throw new Error('Ödeme tutarı, işçinin mevcut net alacağından fazla olamaz.')
  }

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

  // Ödemeyi 'advances' tablosuna 'Maaş Ödemesi' açıklamasıyla ekliyoruz
  // Çünkü avans ve ödeme temelde işçiye nakit çıkışıdır ve net bakiyeyi düşürür.
  const trDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' })
  
  const { error } = await supabase
    .from('advances')
    .insert([{ 
      plan_id, 
      worker_id, 
      amount, 
      date: trDate, 
      description: 'Maaş Ödemesi / Toplu Ödeme' 
    }])

  if (error) {
    throw error
  }

  revalidatePath(`/admin/${plan_id}/payments`)
  revalidatePath(`/admin/${plan_id}/advances`)
  revalidatePath(`/admin/${plan_id}`)
}
