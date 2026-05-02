'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const MIN_NAME_LENGTH = 3
const MAX_NAME_LENGTH = 50
const MAX_PLANS_COUNT = 5

export async function createWorkPlan(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum açmanız gerekiyor')

  const name = (formData.get('name') as string).trim()
  if (name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    throw new Error(`Proje adı ${MIN_NAME_LENGTH} ile ${MAX_NAME_LENGTH} karakter arasında olmalıdır.`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, id')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'worker') {
    throw new Error('Güvenlik: İşçi hesapları yeni proje oluşturamaz.')
  }

  const { count, error: countError } = await supabase
    .from('work_plans')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  if (countError) throw countError
  if (count && count >= MAX_PLANS_COUNT) {
    throw new Error(`Güvenlik: Bir hesap en fazla ${MAX_PLANS_COUNT} proje oluşturabilir.`)
  }

  const { data: plan, error: planError } = await supabase
    .from('work_plans')
    .insert([{ name, created_by: user.id }])
    .select()
    .single()

  if (planError) throw planError

  const emailPrefix = user.email?.split('@')[0] || 'admin'

  // Profil yoksa oluştur (FK hatasını önlemek için — eski hesaplarda oluşabilir)
  if (!profile) {
    await supabase
      .from('profiles')
      .insert([{ id: user.id, username: emailPrefix, full_name: emailPrefix }])
  }

  const { error: memberError } = await supabase
    .from('work_plan_members')
    .insert([{ plan_id: plan.id, user_id: user.id, role: 'admin', full_name: emailPrefix }])

  if (memberError) throw memberError

  revalidatePath('/')
  return plan
}
