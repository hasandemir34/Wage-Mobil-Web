'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateWorker(formData: FormData) {
  const supabase = await createClient()
  
  const planId = formData.get('planId') as string
  const userId = formData.get('userId') as string
  const fullName = formData.get('fullName') as string
  const baseWage = parseFloat(formData.get('baseWage') as string)

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
