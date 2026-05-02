'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkPlan(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Oturum açmanız gerekiyor')

  const rawName = formData.get('name') as string
  const name = rawName.trim()
  if (name.length < 3 || name.length > 50) {
    throw new Error('Proje adı 3 ile 50 karakter arasında olmalıdır.')
  }

  // Güvenlik Koruması: Bir kullanıcı en fazla 5 proje açabilir
  const { count, error: countError } = await supabase
    .from('work_plans')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', user.id)

  if (countError) throw countError
  if (count && count >= 5) {
    throw new Error('Güvenlik: Bir hesap en fazla 5 proje oluşturabilir.')
  }

  // 1. İş planını oluştur
  const { data: plan, error: planError } = await supabase
    .from('work_plans')
    .insert([{ name, created_by: user.id }])
    .select()
    .single()

  if (planError) throw planError

  // 2. Profil kontrolü (Foreign Key hatasını önlemek için)
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Eğer profil yoksa (eski kullanıcı veya hata durumu), oluştur
    await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        username: user.email?.split('@')[0] || 'admin',
        full_name: user.email?.split('@')[0] || 'Yönetici'
      }])
  }

  // 3. Oluşturan kişiyi Admin olarak plana ekle
  const { error: memberError } = await supabase
    .from('work_plan_members')
    .insert([
      { 
        plan_id: plan.id, 
        user_id: user.id, 
        role: 'admin',
        full_name: user.email?.split('@')[0]
      }
    ])

  if (memberError) throw memberError

  revalidatePath('/')
  return plan
}
