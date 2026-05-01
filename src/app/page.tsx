import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Profil bulunamadıysa (yetkisiz erişim)
    await supabase.auth.signOut()
    redirect('/login?message=Hesabınız aktif değil. Lütfen yöneticiye başvurun.')
  }

  if (profile.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/worker')
  }
}
