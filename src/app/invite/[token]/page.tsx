import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { acceptInvitation } from '../../actions/invitations'
import { UserPlus, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ 
  params,
  searchParams
}: { 
  params: Promise<{ token: string }>,
  searchParams: Promise<{ error?: string }>
}) {
  const { token } = await params
  const { error } = await searchParams
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="text-red-500 mb-4 flex justify-center">
            <ShieldCheck size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistem Hatası</h1>
          <p className="text-gray-600">Sistem ayarları eksik (SUPABASE_SERVICE_ROLE_KEY bulunamadı). Lütfen site yöneticisi ile iletişime geçin.</p>
        </div>
      </div>
    )
  }

  const adminClient = createAdminClient()
  
  // Mevcut oturumu kontrol et (Admin veya başka bir kullanıcı açıksa)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invitation } = await adminClient
    .from('invitations')
    .select('*, work_plans(name)')
    .eq('token', token)
    .single()

  if (!invitation || invitation.status === 'accepted' || !invitation.work_plans) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="text-red-500 mb-4 flex justify-center">
            <ShieldCheck size={64} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Geçersiz Davetiye</h1>
          <p className="text-gray-600">Bu davet linki geçersiz, süresi dolmuş veya ilgili proje bulunamadı.</p>
        </div>
      </div>
    )
  }

  const workPlanName = (invitation.work_plans as any)?.name || 'Şantiye'

  // Eğer zaten giriş yapılmışsa, önce çıkış yapmasını iste
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full border-4 border-indigo-50">
          <div className="bg-indigo-100 text-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-4">Oturumunuz Açık</h1>
          <p className="text-gray-500 mb-8 font-medium">
            Şu an <span className="text-indigo-600 font-bold">{user.email}</span> adresiyle giriş yapılmış durumda. 
            Bu daveti kabul edip yeni bir işçi hesabı oluşturmak için önce çıkış yapmalısınız.
          </p>
          <form action="/auth/signout" method="post">
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl text-xl shadow-xl shadow-red-600/20 active:scale-95 transition-all">
              ÇIKIŞ YAP VE DEVAM ET
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full transform hover:scale-[1.02] transition-all">
        <div className="text-center space-y-6">
          <div className="mx-auto bg-indigo-100 text-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center">
            <UserPlus size={40} />
          </div>
          
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hoş Geldin, {invitation.worker_name}!</h1>
            <p className="text-gray-500 mt-2 text-lg">
              <span className="font-bold text-indigo-600">{workPlanName}</span> ekibine katılmak üzeresin.
            </p>
          </div>

          <form action={acceptInvitation} className="space-y-6 text-left">
            <input type="hidden" name="token" value={token} />
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-4 rounded-xl text-center">
                {decodeURIComponent(error)}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider ml-1">Kullanıcı Adı Belirle</label>
              <input 
                name="username" 
                type="text" 
                required 
                placeholder="Örn: ahmet_usta"
                pattern="^[a-zA-Z0-9_]+$"
                title="Sadece İngilizce harfler, rakamlar ve alt çizgi kullanabilirsiniz."
                className="w-full px-4 py-4 bg-white text-gray-900 border border-gray-300 rounded-xl text-xl placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider ml-1">Şifreni Belirle</label>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="En az 6 karakter"
                className="w-full px-4 py-4 bg-white text-gray-900 border border-gray-300 rounded-xl text-xl placeholder:text-gray-500 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-xl text-xl shadow-xl shadow-indigo-600/30 active:scale-95 transition-all">
              HESABIMI OLUŞTUR VE KATIL
            </button>

            <div className="text-center pt-2">
              <a href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                Zaten hesabım var
              </a>
            </div>
          </form>

          <p className="text-xs text-gray-400 font-medium px-8">
            Katılarak sistem kurallarını ve çalışma şartlarını kabul etmiş olursun.
          </p>
        </div>
      </div>
    </div>
  )
}
