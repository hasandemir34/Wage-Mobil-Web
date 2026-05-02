'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      aria-label="Tema değiştir"
      title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-all active:scale-90 ${className}`}
    >
      {theme === 'dark'
        ? <Sun size={18} className="text-yellow-400" />
        : <Moon size={18} className="text-indigo-500" />
      }
    </button>
  )
}
