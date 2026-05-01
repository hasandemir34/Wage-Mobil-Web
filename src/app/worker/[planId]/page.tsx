'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect } from 'next/navigation'
import { CalendarDays, Wallet, TrendingUp, History, X, FileText, ArrowRight } from 'lucide-react'
import WorkerCalendar from './WorkerCalendar'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function WorkerDashboard({ params }: { params: any }) {
  const [data, setData] = useState<any>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { planId } = await params
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        redirect('/login')
        return
      }

      const { data: membership } = await supabase
        .from('work_plan_members')
        .select('*, work_plans(name)')
        .eq('plan_id', planId)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        redirect('/')
        return
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

      setData({ membership, attendance, advances })
      setLoading(false)
    }
    fetchData()
  }, [params])

  if (loading) return <div className="flex items-center justify-center min-h-screen font-bold text-gray-400 uppercase tracking-widest animate-pulse">Yükleniyor...</div>

  const { membership, attendance, advances } = data
  const baseWage = Number(membership.base_daily_wage || 0)
  
  const fullDays = attendance?.filter((a: any) => a.status === 'present').length || 0
  const halfDays = attendance?.filter((a: any) => a.status === 'half_day').length || 0
  const totalWorkedDays = fullDays + halfDays

  const totalWages = attendance?.reduce((sum: number, record: any) => {
    let earned = 0
    if (record.status === 'present') earned = baseWage
    else if (record.status === 'half_day') earned = baseWage / 2
    return sum + earned
  }, 0) || 0

  const totalConcrete = attendance?.reduce((sum: number, record: any) => {
    return sum + Number(record.concrete_bonus || 0)
  }, 0) || 0

  const totalEarned = totalWages + totalConcrete
  const totalAdvances = advances?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0
  const netBalance = totalEarned - totalAdvances

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-24 relative">
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

      {/* Hero: Net Alacak */}
      <div className="bg-green-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-green-600/30 border-b-8 border-green-800">
        <div className="flex items-center gap-3 mb-4 opacity-80">
          <Wallet size={20} />
          <p className="text-xs font-black uppercase tracking-[0.2em]">Kalan Alacak</p>
        </div>
        <div className="text-5xl font-black tracking-tighter tabular-nums">
          {formatCurrency(netBalance)}
        </div>
        <div className="mt-6 pt-6 border-t border-white/20 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-bold opacity-80">
            <span>Yevmiye Toplamı:</span>
            <span>{formatCurrency(totalWages)}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-black">
            <span className="uppercase tracking-widest text-green-200">Beton Mesai Kazancı:</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-md">{formatCurrency(totalConcrete)}</span>
          </div>
          <div className="mt-1 pt-2 border-t border-white/10 flex justify-between items-center text-[10px] font-bold opacity-60 uppercase tracking-widest">
            <span>Toplam Hak Ediş:</span>
            <span>{formatCurrency(totalEarned)}</span>
          </div>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
          <TrendingUp className="text-indigo-600 mb-2" size={24} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Toplam Kazanç</p>
          <p className="text-xl font-black text-gray-900">{formatCurrency(totalEarned)}</p>
        </div>
        
        {/* TAKVİMİ AÇAN KART */}
        <button 
          onClick={() => setShowCalendar(true)}
          className="bg-white p-6 rounded-3xl border-2 border-indigo-100 hover:border-indigo-500 shadow-sm space-y-2 text-left transition-all active:scale-95 group"
        >
          <CalendarDays className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Çalışılan Gün</p>
          <div className="flex items-end justify-between">
            <p className="text-xl font-black text-gray-900">{totalWorkedDays} Gün</p>
            <p className="text-[8px] font-bold text-indigo-600 uppercase">Detay İçin Tıkla</p>
          </div>
        </button>
      </div>

      {/* Rapor Oluşturma Butonu (YENİ) */}
      <div className="px-2">
        <Link 
          href={`/worker/${membership.plan_id}/report`}
          className="w-full bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-gray-700 flex items-center justify-between group hover:border-indigo-500 transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl text-indigo-600">
              <FileText size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase">Çalışma Raporu Oluştur</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tüm hakediş ve puantaj dökümü</p>
            </div>
          </div>
          <ArrowRight className="text-gray-300 group-hover:text-indigo-500 transition-all" size={20} />
        </Link>
      </div>

      {/* Avans Geçmişi */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.15em] px-2 flex items-center gap-2">
          <History size={16} />
          Son Avanslar
        </h3>
        <div className="space-y-3">
          {advances?.slice(0, 5).map((adv: any) => (
            <div key={adv.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-black text-gray-900">
                  {new Date(adv.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </p>
                <p className="text-[10px] font-medium text-gray-400 truncate max-w-[150px]">{adv.description || 'Nakit Avans'}</p>
              </div>
              <p className="text-lg font-black text-red-600">-{formatCurrency(adv.amount)}</p>
            </div>
          ))}
          {(!advances || advances.length === 0) && (
            <p className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-xs font-bold text-gray-400 uppercase italic">
              Henüz avans kaydı yok
            </p>
          )}
        </div>
      </div>

      {/* TAKVİM MODALI */}
      {showCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/60 transition-all">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl relative animate-in fade-in zoom-in duration-300 overflow-hidden border-4 border-white/10">
            {/* Kapatma Butonu - Daha Üstte ve Belirgin */}
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setShowCalendar(false)}
                className="p-3 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl hover:bg-red-500 hover:text-white text-gray-500 transition-all shadow-lg active:scale-90"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-2 pt-12"> {/* İçeriği biraz aşağı kaydırdık ki X butonuyla çakışmasın */}
              <WorkerCalendar attendance={attendance || []} />
            </div>
          </div>
          {/* Arka plana tıklayınca kapat */}
          <div className="absolute inset-0 -z-10" onClick={() => setShowCalendar(false)} />
        </div>
      )}
    </div>
  )
}

