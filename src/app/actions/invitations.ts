'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const MAX_PENDING_INVITATIONS = 50
const MAX_ACCOUNTS_PER_DEVICE = 3
const MIN_WORKER_NAME_LENGTH = 2
const MAX_WORKER_NAME_LENGTH = 50
const MIN_USERNAME_LENGTH = 3
const MAX_USERNAME_LENGTH = 20
const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 50

export async function createInvitation(formData: FormData) {
  const supabase = await createClient()
  const plan_id = formData.get('plan_id') as string
  const rawWorkerName = formData.get('worker_name') as string
  const base_daily_wage = parseFloat(formData.get('base_daily_wage') as string)

  const worker_name = rawWorkerName.trim()
  if (!worker_name || worker_name.length < MIN_WORKER_NAME_LENGTH || worker_name.length > MAX_WORKER_NAME_LENGTH) {
    throw new Error(`İşçi adı ${MIN_WORKER_NAME_LENGTH} ile ${MAX_WORKER_NAME_LENGTH} karakter arasında olmalıdır.`)
  }
  if (isNaN(base_daily_wage) || base_daily_wage < 0 || base_daily_wage > 1000000) {
    throw new Error('Geçersiz yevmiye ücreti.')
  }

  // Kötüye kullanım koruması: bekleyen davetiye sınırı
  const { count, error: countError } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('plan_id', plan_id)
    .eq('status', 'pending')

  if (countError) throw new Error(countError.message)
  if (count && count >= MAX_PENDING_INVITATIONS) {
    throw new Error(`Güvenlik: Bir proje için en fazla ${MAX_PENDING_INVITATIONS} adet bekleyen davetiye olabilir. Lütfen önce mevcut davetlerin kabul edilmesini bekleyin veya gereksizleri silin.`)
  }

  const adminClient = createAdminClient()

  // Geçici (ghost) auth kullanıcısı oluştur — işçi hesabını aktifleştirene kadar yoklama/avans takibi bu hesap üzerinden yapılır
  const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
    email: `${crypto.randomUUID()}@ghost.yevmiye.local`,
    password: crypto.randomUUID(),
    email_confirm: true,
    user_metadata: { full_name: worker_name }
  })

  if (authError) throw new Error(authError.message)

  const ghostUsername = `user_${authUser.user.id.replace(/-/g, '').substring(0, 8)}`

  const { error: profileError } = await adminClient
    .from('profiles')
    .insert([{ id: authUser.user.id, username: ghostUsername, full_name: worker_name }])

  if (profileError) throw new Error(profileError.message)

  // İşçiyi plana hemen ekle — işveren anında yoklama girebilir
  const { error: memberError } = await adminClient
    .from('work_plan_members')
    .insert([{ plan_id, user_id: authUser.user.id, role: 'worker', base_daily_wage, full_name: worker_name }])

  if (memberError) throw new Error(memberError.message)

  const { data: invitation, error } = await adminClient
    .from('invitations')
    .insert([{ plan_id, worker_name, base_daily_wage, user_id: authUser.user.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/admin/${plan_id}/workers`)
  return invitation
}

export async function acceptInvitation(formData: FormData) {
  const supabase = await createClient()
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const rawUsername = formData.get('username') as string
  const username = rawUsername.toLowerCase().trim()

  // Cihaz başına hesap sınırı (kötüye kullanım koruması)
  const cookieStore = await cookies()
  const creationCount = parseInt(cookieStore.get('yevmi_account_creation_count')?.value || '0')

  if (creationCount >= MAX_ACCOUNTS_PER_DEVICE) {
    redirect(`/invite/${token}?error=${encodeURIComponent(`Güvenlik ihlali şüphesi: Bu cihazdan açılabilecek maksimum hesap sınırına (${MAX_ACCOUNTS_PER_DEVICE}) ulaştınız.`)}`)
  }

  if (username.length < MIN_USERNAME_LENGTH || username.length > MAX_USERNAME_LENGTH) {
    redirect(`/invite/${token}?error=${encodeURIComponent(`Kullanıcı adı ${MIN_USERNAME_LENGTH} ile ${MAX_USERNAME_LENGTH} karakter arasında olmalıdır.`)}`)
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Kullanıcı adı sadece İngilizce harf, rakam ve alt çizgi içerebilir.')}`)
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    redirect(`/invite/${token}?error=${encodeURIComponent(`Şifre ${MIN_PASSWORD_LENGTH} ile ${MAX_PASSWORD_LENGTH} karakter arasında olmalıdır.`)}`)
  }

  // Race condition koruması: davetiyeyi bul ve durumunu kontrol et
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (invError || !invitation) throw new Error('Geçersiz davetiye')
  if (invitation.status === 'accepted') {
    redirect(`/invite/${token}?error=${encodeURIComponent('Bu hesap zaten aktifleştirilmiş.')}`)
  }

  const adminClient = createAdminClient()
  const email = `${username}@yevmiye.local`

  // Kullanıcı adının başka biri tarafından alınmadığını kontrol et
  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', invitation.user_id)
    .maybeSingle()

  if (existingProfile) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir ad seçin.')}`)
  }

  // Ghost kullanıcının email ve şifresini işçinin seçtiği bilgilerle güncelle
  const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
    invitation.user_id,
    { email, password }
  )

  if (updateAuthError) {
    redirect(`/invite/${token}?error=${encodeURIComponent('Bir hata oluştu: ' + updateAuthError.message)}`)
  }

  // Profil kullanıcı adını güncelle
  const { error: profileUpdateError } = await adminClient
    .from('profiles')
    .update({ username })
    .eq('id', invitation.user_id)

  if (profileUpdateError) throw profileUpdateError

  await adminClient
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('id', invitation.id)

  // Cihaz hesap aktivasyon sayacını artır
  cookieStore.set('yevmi_account_creation_count', (creationCount + 1).toString(), {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
  if (loginError) throw loginError

  redirect(`/worker/${invitation.plan_id}`)
}
