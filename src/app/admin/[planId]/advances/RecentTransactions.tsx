'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, History } from 'lucide-react'

interface Advance {
  id: string
  date: string
  worker_id: string
  amount: number
  description?: string
}

interface Member {
  user_id: string
  full_name: string
  profiles?: { username?: string } | null
}

export default function RecentTransactions({ advances, members }: { advances: Advance[], members: Member[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl px-8 py-5 shadow-lg hover:shadow-xl transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-xl text-gray-500">
            <History size={20} />
          </div>
          <span className="text-lg font-black text-gray-800 dark:text-white">Son İşlemler</span>
          <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">{advances.length}</span>
        </div>
        {open ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
      </button>

      {open && (
        <div className="mt-3 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">Tarih</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">Kişi</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider">Tür</th>
                  <th className="px-8 py-6 text-sm font-black text-gray-400 uppercase tracking-wider text-right">Miktar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {advances.map(adv => {
                  const member = members.find(m => m.user_id === adv.worker_id)
                  const isPayment = adv.description === 'Maaş Ödemesi / Toplu Ödeme'
                  return (
                    <tr key={adv.id} className={`transition-all ${isPayment ? 'hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10' : 'hover:bg-red-50/30 dark:hover:bg-red-900/10'}`}>
                      <td className="px-8 py-6 text-lg font-bold text-gray-500">{new Date(adv.date).toLocaleDateString('tr-TR')}</td>
                      <td className="px-8 py-6 text-xl font-bold text-gray-900 dark:text-white">
                        {member?.full_name || 'Bilinmeyen'}
                        <span className="block text-xs text-gray-400 font-semibold">@{member?.profiles?.username}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${isPayment ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                          {isPayment ? 'Ödeme' : 'Avans'}
                        </span>
                        {adv.description && !isPayment && (
                          <span className="block text-xs text-gray-400 mt-1">{adv.description}</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`text-2xl font-black ${isPayment ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                          ₺{adv.amount.toLocaleString('tr-TR')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
