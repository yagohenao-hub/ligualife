import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const attr = document.documentElement.getAttribute('data-theme')
      const saved = localStorage.getItem('lingua_theme')
      const initial: 'dark' | 'light' =
        saved === 'light' || attr === 'light' ? 'light' : 'dark'
      setTheme(initial)
      document.documentElement.setAttribute('data-theme', initial)
      if (initial === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch {}
  }, [])

  const toggleTheme = () => {
    const next: 'dark' | 'light' = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    if (next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    try {
      localStorage.setItem('lingua_theme', next)
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`cel-theme-toggle ${className}`}
      aria-label={theme === 'dark' ? 'Cambiar a modo claro Celadon' : 'Cambiar a modo oscuro Obsidian'}
      title={theme === 'dark' ? 'Modo Claro Celadon' : 'Modo Oscuro Obsidian'}
    >
      {mounted && theme === 'light' ? (
        <>
          <Moon size={15} style={{ color: 'var(--brand-purple, #8C31C5)' }} />
          <span>Obsidian</span>
        </>
      ) : (
        <>
          <Sun size={15} style={{ color: 'var(--brand-yellow, #FDBA3B)' }} />
          <span>Celadon</span>
        </>
      )}
    </button>
  )
}
