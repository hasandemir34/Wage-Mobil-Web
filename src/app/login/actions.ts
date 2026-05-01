'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const rawUsername = formData.get('username') as string
  const username = rawUsername.toLowerCase().replace(/\s+/g, '')
  
  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect(`/login?message=${encodeURIComponent('Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir.')}`)
  }

  const shadowEmail = `${username}@yevmiye.local`

  const data = {
    email: shadowEmail,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const message = error.message.includes('Invalid login credentials')
      ? 'Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.'
      : `Giriş başarısız: ${error.message}`
    redirect(`/login?message=${encodeURIComponent(message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const rawUsername = formData.get('username') as string
  const username = rawUsername.toLowerCase().replace(/\s+/g, '')

  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect(`/login?message=${encodeURIComponent('Kullanıcı adı sadece küçük harf, rakam ve alt çizgi içerebilir.')}`)
  }

  const shadowEmail = `${username}@yevmiye.local`

  const data = {
    email: shadowEmail,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    const message = error.message.includes('already registered')
      ? 'Bu kullanıcı adı zaten alınmış. Lütfen giriş yapın veya farklı bir ad seçin.'
      : `Kayıt başarısız: ${error.message}`
    redirect(`/login?message=${encodeURIComponent(message)}`)
  }

  // 4. Profil oluştur
  const { error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: data.user?.id,
      username: username,
      full_name: username // Admin için başlangıçta username kullanabiliriz
    }])

  revalidatePath('/', 'layout')
  redirect(`/login?success=${encodeURIComponent('Kayıt başarılı! Şimdi giriş yapabilirsiniz.')}`)
}
