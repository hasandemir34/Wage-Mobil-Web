'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const message = error.message.includes('Invalid login credentials')
      ? 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.'
      : `Giriş başarısız: ${error.message}`
    redirect(`/login?message=${encodeURIComponent(message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    const message = error.message.includes('already registered')
      ? 'Bu e-posta zaten kayıtlı. Lütfen giriş yapın.'
      : `Kayıt başarısız: ${error.message}`
    redirect(`/login?message=${encodeURIComponent(message)}`)
  }

  // Supabase email confirmation enabled ise bilgilendirme mesajı göster
  revalidatePath('/', 'layout')
  redirect(`/login?success=${encodeURIComponent('Kayıt başarılı! E-postanızı doğrulayın, ardından giriş yapabilirsiniz.')}`)
}
