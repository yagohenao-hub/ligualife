import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PinInput } from '@/components/PinInput'
import { useAppContext } from '@/context/AppContext'
import styles from '@/styles/Home.module.css'

export default function DirectLoginPage() {
  const router = useRouter()
  const { setAppState } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePin(pin: string) {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/validate-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'PIN inválido. Verifica tus datos.')
        return
      }

      if (data.role === 'teacher') {
        const session = { teacherId: data.teacherId, name: data.name }
        sessionStorage.setItem('lingualife_session', JSON.stringify(session))
        setAppState({ teacher: { id: data.teacherId, name: data.name } })
        router.push('/dashboard')
      } else if (data.role === 'student') {
        sessionStorage.setItem('ll_student', JSON.stringify(data))
        router.push('/student')
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Acceso por PIN | LinguaLife</title>
      </Head>
      <div className={styles.container}>
        <div className={`glass ${styles.card}`}>
          <h1 className={styles.logo}>LinguaLife</h1>
          <p className={styles.subtitle}>Introduce tu PIN para acceder al portal</p>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <PinInput onSubmit={handlePin} loading={loading} />
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a 
              href="/" 
              style={{ color: '#a1a1aa', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              ← Volver a la página principal
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
