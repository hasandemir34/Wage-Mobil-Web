'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function createInvitation(formData: FormData) {
  const supabase = await createClient()
  const plan_id = formData.get('plan_id') as string
  const rawWorkerName = formData.get('worker_name') as string
  const base_daily_wage = parseFloat(formData.get('base_daily_wage') as string)

  // 1. Girdi Doğrulama (Input Validation)
  const worker_name = rawWorkerName.trim()
  if (!worker_name || worker_name.length < 2 || worker_name.length > 50) {
    throw new Error('İşçi adı 2 ile 50 karakter arasında olmalıdır.')
  }
  if (isNaN(base_daily_wage) || base_daily_wage < 0 || base_daily_wage > 1000000) {
    throw new Error('Geçersiz yevmiye ücreti.')
  }

  // 2. Kötüye Kullanım Koruması: Bekleyen Davetiye Sınırı (Max 50)
  const { count, error: countError } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('plan_id', plan_id)
    .eq('status', 'pending')

  if (countError) throw countError
  if (count && count >= 50) {
    throw new Error('Güvenlik: Bir proje için en fazla 50 adet bekleyen davetiye olabilir. Lütfen önce mevcut davetlerin kabul edilmesini bekleyin veya gereksizleri silin.')
  }

  // 3. Davetiye Oluştur
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

  // 1. Cihaz Başına Hesap Sınırı (Kötüye Kullanım Koruması - Max 3)
  const cookieStore = await cookies()
  const creationCount = parseInt(cookieStore.get('yevmi_account_creation_count')?.value || '0')
  
  if (creationCount >= 3) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Güvenlik ihlali şüphesi: Bu cihazdan açılabilecek maksimum hesap sınırına (3) ulaştınız.')}`)
  }

  // 2. Girdi Doğrulama (Input Validation)
  if (username.length < 3 || username.length > 20) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Kullanıcı adı 3 ile 20 karakter arasında olmalıdır.')}`)
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Kullanıcı adı sadece İngilizce harf, rakam ve alt çizgi içerebilir.')}`)
  }
  if (password.length < 6 || password.length > 50) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Şifre 6 ile 50 karakter arasında olmalıdır.')}`)
  }

  // 3. Davetiyeyi bul ve durumunu kontrol et (Race Condition Koruması)
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (invError || !invitation) throw new Error('Geçersiz davetiye')
  if (invitation.status === 'accepted') {
    redirect(`/invite/${token}?error=${encodeURIComponent('Bu davetiye zaten kullanılmış.')}`)
  }

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

  // 7. Davetiye durumunu güncelle
  await adminClient
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id)

  // 8. Cihaz hesap oluşturma sayacını artır (Güvenlik)
  cookieStore.set('yevmi_account_creation_count', (creationCount + 1).toString(), {
    maxAge: 60 * 60 * 24 * 365, // 1 yıl
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  // 9. Giriş yap
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (loginError) throw loginError

  redirect(`/worker/${invitation.plan_id}`)
}
