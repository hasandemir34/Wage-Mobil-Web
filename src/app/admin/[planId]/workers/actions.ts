'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorker(formData: FormData) {
  const supabase = await createClient()
  
  // Güvenlik kontrolü: Sadece admin yapabilir
  const { data: { user: adminUser } } = await supabase.auth.getUser()
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', adminUser?.id).single()
  
  if (adminProfile?.role !== 'admin') {
    throw new Error('Yetkisiz işlem')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const full_name = formData.get('full_name') as string
  const base_wage = parseFloat(formData.get('base_wage') as string) || 0

  const adminClient = createAdminClient()

  // 1. Auth kullanıcısını oluştur (Email onayı beklememesi için admin client kullanılır)
  const { data: newUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Otomatik doğrula
    user_metadata: { full_name }
  })

  if (authError) return { error: authError.message }

  // 2. Profile kaydını oluştur
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert([
      { 
        id: newUser.user.id, 
        full_name, 
        role: 'worker', 
        base_wage 
      }
    ])

  if (profileError) return { error: profileError.message }

  revalidatePath('/admin/workers')
  return { success: true }
}

export async function updateWorker(formData: FormData) {
  const supabase = await createClient()
  const plan_id = formData.get('plan_id') as string
  const user_id = formData.get('user_id') as string
  const full_name = formData.get('full_name') as string
  const base_daily_wage = parseFloat(formData.get('base_daily_wage') as string) || 0

  const { error } = await supabase
    .from('work_plan_members')
    .update({ 
      full_name, 
      base_daily_wage 
    })
    .eq('plan_id', plan_id)
    .eq('user_id', user_id)

  if (error) throw error

  revalidatePath(`/admin/${plan_id}/workers`)
}
