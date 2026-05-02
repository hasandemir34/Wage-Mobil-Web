'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWorker(formData: FormData) {
  const supabase = await createClient()
  
  const planId = formData.get('planId') as string
  const userId = formData.get('userId') as string
  const rawFullName = formData.get('fullName') as string
  const baseWage = parseFloat(formData.get('baseWage') as string)
  
  const fullName = rawFullName.trim()
  if (fullName.length < 2 || fullName.length > 50) {
    throw new Error('İsim 2 ile 50 karakter arasında olmalıdır.')
  }
  if (baseWage < 0 || baseWage > 1000000) {
    throw new Error('Geçersiz yevmiye tutarı.')
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

  const { error } = await supabase
    .from('work_plan_members')
    .update({ 
      full_name: fullName,
      base_daily_wage: baseWage 
    })
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('Worker Update Error:', error)
    throw error
  }

  revalidatePath(`/admin/${planId}/workers`)
}
