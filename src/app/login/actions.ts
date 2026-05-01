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
  const username = rawUsername.toLowerCase().trim()

  if (!/^[a-z0-9_çğıöşü]+$/.test(username)) {
    redirect(`/login?message=${encodeURIComponent('Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.')}`)
  }

  // 1. Kullanıcı adı zaten var mı kontrol et
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (existingUser) {
    redirect(`/login?message=${encodeURIComponent('Bu kullanıcı adı zaten alınmış. Lütfen farklı bir ad seçin.')}`)
  }

  const shadowEmail = `${username}@yevmiye.local`

  const authData = {
    email: shadowEmail,
    password: formData.get('password') as string,
  }

  const { data: signUpData, error } = await supabase.auth.signUp(authData)

  if (error) {
    const message = error.message.includes('already registered')
      ? 'Bu kullanıcı adı zaten alınmış. Lütfen giriş yapın veya farklı bir ad seçin.'
      : `Kayıt başarısız: ${error.message}`
    redirect(`/login?message=${encodeURIComponent(message)}`)
  }

  // 4. Profil oluştur
  if (signUpData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: signUpData.user.id,
        username: username,
        full_name: username 
      }])
    
    if (profileError) {
      console.error('Profil oluşturma hatası:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  redirect(`/login?success=${encodeURIComponent('Kayıt başarılı! Şimdi giriş yapabilirsiniz.')}`)
}
