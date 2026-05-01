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

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // Profil yoksa veya hata varsa, yeni kayıt olmuş olabilir.
    // Varsayılan olarak worker atayabiliriz veya admin'in onayını beklemesini söyleyebiliriz.
    // Şimdilik admin olarak profil oluşturma kısmını burada manuel ekleyebiliriz (test için).
    const { data: countData } = await supabase.from('profiles').select('id', { count: 'exact' })
    const isFirstUser = countData?.length === 0

    const newRole = isFirstUser ? 'admin' : 'worker'
    
    await supabase.from('profiles').insert([
      { id: user.id, full_name: user.email?.split('@')[0], role: newRole, base_wage: 0 }
    ])

    if (newRole === 'admin') {
      redirect('/admin')
    } else {
      redirect('/worker')
    }
  }

  if (profile.role === 'admin') {
    redirect('/admin')
  } else {
    redirect('/worker')
  }
}
