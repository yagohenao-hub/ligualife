import { useEffect } from 'react'

export function ThemeToggle({ className = '' }: { className?: string }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
    try {
      localStorage.setItem('lingua_theme', 'dark')
    } catch (e) {}
  }, [])

  // Pure dark mode: no toggle button rendered
  return null
}
