'use client'

import { Copy } from 'lucide-react'

export default function CopyInviteButton({ token }: { token: string }) {
  const copyLink = () => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    alert('Davet linki kopyalandı! WhatsApp üzerinden işçiye gönderebilirsiniz.')
  }

  return (
    <button 
      onClick={copyLink}
      className="bg-white hover:bg-orange-100 text-orange-600 p-4 rounded-2xl shadow-sm border-2 border-orange-200 transition-all active:scale-90"
      title="Linki Kopyala"
    >
      <Copy size={24} />
    </button>
  )
}
