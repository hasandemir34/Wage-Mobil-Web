'use client'

import { useState } from 'react'
import { FileText, Calendar, ChevronRight, Printer, X } from 'lucide-react'
import Link from 'next/link'

export default function ReportPanel({ planId }: { planId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const reportOptions = [
    { label: 'Son 1 Ay', value: '1', desc: 'Son 30 günlük kayıtlar' },
    { label: 'Son 3 Ay', value: '3', desc: 'Son 90 günlük kayıtlar' },
    { label: 'Tüm Geçmiş', value: 'all', desc: 'Projeye başlangıçtan itibaren' },
  ]

  return (
    <div className="relative">
      {/* Rapor Kartı */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
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

      {/* Seçim Modalı (Merkezi Konumlandırma) */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
          {/* Arka Plan Karartma */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Modal İçeriği */}
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border-2 border-indigo-500 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-xl text-white">
                  <FileText size={20} />
                </div>
                <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Rapor Aralığı</h4>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid gap-4">
              {reportOptions.map((opt) => (
                <Link
                  key={opt.value}
                  href={`/admin/${planId}/report?range=${opt.value}`}
                  className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-50 dark:border-gray-700 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
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
                </Link>
              ))}
            </div>

            <div className="mt-8 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800 flex gap-4">
              <Printer className="text-indigo-600 shrink-0 mt-1" size={20} />
              <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Rapor sayfasında "PDF OLARAK KAYDET" butonunu kullanarak dökümanı indirebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
