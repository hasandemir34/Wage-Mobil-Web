'use client'

import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function WorkerReportHeader({ planId }: { planId: string }) {
  return (
    <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl">
      <Link href={`/worker/${planId}`} className="flex items-center gap-2 font-bold opacity-80 hover:opacity-100 transition-all">
        <ArrowLeft size={20} /> Panele Dön
      </Link>
      <button 
        onClick={() => window.print()} 
        className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all"
      >
        <Printer size={20} /> RAPORU PDF OLARAK KAYDET
      </button>
    </div>
  )
}
