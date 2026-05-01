'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createInvitation(formData: FormData) {
  const supabase = await createClient()
  const plan_id = formData.get('plan_id') as string
  const worker_name = formData.get('worker_name') as string
  const base_daily_wage = parseFloat(formData.get('base_daily_wage') as string)

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert([{ plan_id, worker_name, base_daily_wage }])
    .select()
    .single()

  if (error) throw error

  revalidatePath(`/admin/${plan_id}/workers`)
  return invitation
}

export async function acceptInvitation(formData: FormData) {
  const supabase = await createClient()
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const rawUsername = formData.get('username') as string
  const username = rawUsername.toLowerCase().trim()

  if (!/^[a-z0-9_çğıöşü]+$/.test(username)) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.')}`)
  }

  // 1. Davetiyeyi bul
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (invError || !invitation) throw new Error('Geçersiz davetiye')

  // 2. Dummy email üret
  const email = `${username}@yevmiye.local`

  // 3. Kullanıcıyı oluştur (Admin client ile)
  const adminClient = createAdminClient()
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: invitation.worker_name, username: username }
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      redirect(`/invite/${token}?error=${encodeURIComponent('Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir ad seçin.')}`)
    }
    redirect(`/invite/${token}?error=${encodeURIComponent(authError.message)}`)
  }

  // 4. Profil oluştur
  const { error: profileError } = await adminClient
    .from('profiles')
    .insert([{
      id: authUser.user.id,
      username: username,
      full_name: invitation.worker_name
    }])

  if (profileError) throw profileError

  // 5. Kullanıcıyı iş planına üye olarak ekle
  const { error: memberError } = await adminClient
    .from('work_plan_members')
    .insert([{
      plan_id: invitation.plan_id,
      user_id: authUser.user.id,
      role: 'worker',
      base_daily_wage: invitation.base_daily_wage,
      full_name: invitation.worker_name
    }])

  if (memberError) throw memberError

  // 5. Davetiye durumunu güncelle
  await adminClient
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id)

  // 6. Giriş yap
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) throw loginError

  redirect(`/worker/${invitation.plan_id}`)
}
