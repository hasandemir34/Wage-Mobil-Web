'use client'

import { useState } from 'react'
import { FileText, Calendar, ChevronRight, Printer, X, Users, Check, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Worker { id: string; name: string }

export default function ReportPanel({ planId, workers }: { planId: string; workers: Worker[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(workers.map(w => w.id)))

  const reportOptions = [
    { label: 'Son 1 Ay', value: '1', desc: 'Son 30 günlük kayıtlar' },
    { label: 'Son 3 Ay', value: '3', desc: 'Son 90 günlük kayıtlar' },
    { label: 'Tüm Geçmiş', value: 'all', desc: 'Projeye başlangıçtan itibaren' },
  ]

  const allSelected = selectedIds.size === workers.length

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(workers.map(w => w.id)))
  }

  const openModal = () => {
    setStep(1)
    setSelectedIds(new Set(workers.map(w => w.id)))
    setIsOpen(true)
  }

  const goToReport = (range: string) => {
    const workerParam = Array.from(selectedIds).join(',')
    router.push(`/admin/${planId}/report?range=${range}&workers=${workerParam}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={openModal}
        className="w-full bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:border-indigo-500 transition-all active:scale-95"
      >
        <div className="flex items-center gap-5">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <FileText size={32} />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Doküman Oluştur</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Puantaj & Ödeme Raporu</p>
          </div>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-indigo-500 transition-all" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border-2 border-indigo-500 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400 mr-1">
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  {step === 1 ? <Users size={20} /> : <Calendar size={20} />}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                    {step === 1 ? 'İşçi Seçin' : 'Rapor Aralığı'}
                  </h4>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{step}/2</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Adım 1: İşçi Seçimi */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Tümünü Seç */}
                <button
                  onClick={toggleAll}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${allSelected ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-300'}`}
                >
                  <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {allSelected ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${allSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                    {allSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                  </div>
                </button>

                <div className="h-px bg-gray-100 dark:bg-gray-700" />

                {/* İşçi Listesi */}
                <div className="space-y-2">
                  {workers.map(w => {
                    const selected = selectedIds.has(w.id)
                    return (
                      <button
                        key={w.id}
                        onClick={() => toggle(w.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selected ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200'}`}
                      >
                        <span className={`font-bold text-lg ${selected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{w.name}</span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${selected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {selected && <Check size={14} className="text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <button
                  disabled={selectedIds.size === 0}
                  onClick={() => setStep(2)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-lg shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  Devam Et ({selectedIds.size} İşçi) <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* Adım 2: Aralık Seçimi */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {reportOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => goToReport(opt.value)}
                      className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-50 dark:border-gray-700 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group w-full text-left"
                    >
                      <div className="flex items-center gap-5">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-black text-gray-900 dark:text-white">{opt.label}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-600 transition-all" />
                    </button>
                  ))}
                </div>

                <div className="mt-4 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 flex gap-4">
                  <Printer className="text-indigo-600 shrink-0 mt-1" size={20} />
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                    Rapor sayfasında &quot;PDF OLARAK KAYDET&quot; butonunu kullanarak dökümanı indirebilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
