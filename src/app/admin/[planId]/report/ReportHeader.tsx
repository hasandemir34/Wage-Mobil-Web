'use client'

import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ReportHeader({ planId }: { planId: string }) {
  return (
    <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center print:hidden bg-gray-50 dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
      <Link href={`/admin/${planId}`} className="flex items-center gap-2 text-gray-500 font-bold hover:text-indigo-600 transition-all">
        <ArrowLeft size={20} /> Panele Dön
      </Link>
      <button 
        onClick={() => window.print()} 
        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
      >
        <Printer size={20} /> PDF OLARAK KAYDET / YAZDIR
      </button>
    </div>
  )
}
