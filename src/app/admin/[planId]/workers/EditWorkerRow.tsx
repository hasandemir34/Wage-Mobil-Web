'use client'

import { useState } from 'react'
import { Pencil, Check, X, User } from 'lucide-react'
import { updateWorker } from './actions'

interface Worker {
  user_id: string
  full_name: string
  base_daily_wage: number
  profiles: { username: string }
}

export default function EditWorkerRow({ worker, planId }: { worker: any, planId: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState(worker.full_name)
  const [wage, setWage] = useState(worker.base_daily_wage)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const formData = new FormData()
    formData.append('plan_id', planId)
    formData.append('user_id', worker.user_id)
    formData.append('full_name', fullName)
    formData.append('base_daily_wage', wage.toString())

    try {
      await updateWorker(formData)
      setIsEditing(false)
    } catch (err) {
      alert('Güncelleme sırasında hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <tr className="bg-indigo-50/50 dark:bg-indigo-900/10">
        <td className="px-8 py-4">
          <input 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3 py-2 border-2 border-indigo-200 rounded-lg font-bold outline-none focus:border-indigo-600 dark:bg-gray-800 dark:border-gray-700"
          />
        </td>
        <td className="px-8 py-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-gray-400">₺</span>
            <input 
              type="number"
              value={wage}
              onChange={(e) => setWage(parseFloat(e.target.value))}
              className="w-24 px-3 py-2 border-2 border-indigo-200 rounded-lg font-black outline-none focus:border-indigo-600 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </td>
        <td className="px-8 py-4 text-right">
          <div className="flex justify-end gap-2">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              <Check size={20} />
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="p-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all">
      <td className="px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl text-gray-400 group-hover:text-indigo-600 transition-colors">
            <User size={20} />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{worker.full_name}</div>
            <div className="text-sm font-semibold text-gray-400">@{worker.profiles?.username}</div>
          </div>
        </div>
      </td>
      <td className="px-8 py-6">
        <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">₺{worker.base_daily_wage}</div>
      </td>
      <td className="px-8 py-6 text-right">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
        >
          <Pencil size={20} />
        </button>
      </td>
    </tr>
  )
}
