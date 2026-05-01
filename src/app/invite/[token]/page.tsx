import { createAdminClient } from '@/utils/supabase/admin'
import { acceptInvitation } from '../../actions/invitations'
import { UserPlus, ShieldCheck } from 'lucide-react'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: invitation } = await supabase
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
          </form>

          <p className="text-xs text-gray-400 font-medium px-8">
            Katılarak sistem kurallarını ve çalışma şartlarını kabul etmiş olursun.
          </p>
        </div>
      </div>
    </div>
  )
}
