import { createClient } from '@/utils/supabase/server'
import { CalendarDays, Banknote, Clock, Wallet, TrendingUp, History } from 'lucide-react'

export default async function WorkerDashboard({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Verileri Çek
  const { data: membership } = await supabase
    .from('work_plan_members')
    .select('*, work_plans(name)')
    .eq('plan_id', planId)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full border-2 border-red-100">
          <p className="text-xl font-bold text-red-600">Erişim Engellendi</p>
          <p className="text-gray-500 mt-2">Bu projeye erişim yetkiniz bulunmuyor.</p>
        </div>
      </div>
    )
  }

  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('plan_id', planId)
    .eq('worker_id', user.id)
    .order('date', { ascending: false })

  const { data: advances } = await supabase
    .from('advances')
    .select('*')
    .eq('plan_id', planId)
    .eq('worker_id', user.id)
    .order('date', { ascending: false })

  // 2. Hesaplamalar
  const baseWage = Number(membership.base_daily_wage || 0)
  
  const fullDays = attendance?.filter(a => a.status === 'present').length || 0
  const halfDays = attendance?.filter(a => a.status === 'half_day').length || 0
  const totalWorkedDays = fullDays + halfDays
  
  const totalEarned = (fullDays * baseWage) + (halfDays * (baseWage / 2))
  const totalAdvances = advances?.reduce((sum, item) => sum + Number(item.amount), 0) || 0
  const netBalance = totalEarned - totalAdvances

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-24">
      {/* Header */}
      <div className="px-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Merhaba, {(membership.full_name || 'İşçi').split(' ')[0]}!
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
            {membership.work_plans.name}
          </p>
          <span className="text-gray-300">•</span>
          <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">
            Yevmİye: {formatCurrency(baseWage)}
          </p>
        </div>
      </div>

      {/* Hero: Net Alacak (Yeşil Kart) */}
      <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-green-600/30 border-b-8 border-green-800">
        <div className="flex items-center gap-3 mb-4 opacity-80">
          <Wallet size={20} />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Kalan Alacak</p>
        </div>
        <div className="text-5xl font-black tracking-tighter tabular-nums">
          {formatCurrency(netBalance)}
        </div>
        <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
          <p className="text-xs font-bold opacity-70">Güncel hesap özeti</p>
          <div className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Aktİf</div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
          <TrendingUp className="text-indigo-600 mb-2" size={24} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Toplam Hak Ediş</p>
          <p className="text-xl font-black text-gray-900">{formatCurrency(totalEarned)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
          <CalendarDays className="text-orange-500 mb-2" size={24} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Çalışılan Gün</p>
          <p className="text-xl font-black text-gray-900">{totalWorkedDays} Gün</p>
        </div>
      </div>

      {/* Alınan Avanslar Özeti */}
      <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl text-red-600 shadow-sm">
            <Banknote size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-red-400 uppercase tracking-wider">Toplam Alınan Avans</p>
            <p className="text-xl font-black text-red-700">{formatCurrency(totalAdvances)}</p>
          </div>
        </div>
      </div>

      {/* Yoklama Geçmişi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
            <History size={16} />
            Son Çalışmalar
          </h3>
        </div>
        <div className="space-y-3">
          {attendance?.slice(0, 10).map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${record.status === 'present' ? 'bg-green-500' : record.status === 'half_day' ? 'bg-orange-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-sm font-black text-gray-900">
                    {new Date(record.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'short' })}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {record.status === 'present' ? 'Tam Gün' : record.status === 'half_day' ? 'Yarım Gün' : 'Yok'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-700">
                  {record.status === 'present' ? formatCurrency(baseWage) : record.status === 'half_day' ? formatCurrency(baseWage / 2) : '₺0'}
                </p>
              </div>
            </div>
          ))}
          {(!attendance || attendance.length === 0) && (
            <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-xs font-bold text-gray-400 uppercase">Henüz yoklama kaydı yok</p>
            </div>
          )}
        </div>
      </div>

      {/* Avans Geçmişi */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.15em] px-2">Son Avanslar</h3>
        <div className="space-y-3">
          {advances?.slice(0, 5).map((adv) => (
            <div key={adv.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-black text-gray-900">{new Date(adv.date).toLocaleDateString('tr-TR')}</p>
                <p className="text-[10px] font-medium text-gray-400 truncate max-w-[150px]">{adv.description || 'Nakit Avans'}</p>
              </div>
              <p className="text-lg font-black text-red-600">-{formatCurrency(adv.amount)}</p>
            </div>
          ))}
          {(!advances || advances.length === 0) && (
            <p className="text-center py-6 text-xs font-bold text-gray-400 uppercase italic">Henüz avans alınmadı</p>
          )}
        </div>
      </div>
    </div>
  )
}

