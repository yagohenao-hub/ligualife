import { useEffect } from 'react'
import { useRouter } from 'next/router'
import type { AppProps } from 'next/app'
import { AppProvider } from '@/context/AppContext'
import '@/styles/globals.css'
import '@/styles/celadon.css'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Limpieza global de scroll y touch-action en transiciones de página
  useEffect(() => {
    const handleRouteChange = () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
        document.body.style.touchAction = ''
      }
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])

  return (
    <AppProvider>
      <Component {...pageProps} />
    </AppProvider>
  )
}

