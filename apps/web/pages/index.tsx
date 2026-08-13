import { useState } from 'react'
import { useRouter } from 'next/router'
import { PinInput } from '@/components/PinInput'
import { useAppContext } from '@/context/AppContext'
import styles from '@/styles/Home.module.css'

export default function LoginPage() {
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
        setError(data.error || 'PIN inválido')
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
    <div className={styles.container}>
      <div className={`glass ${styles.card}`}>
        <h1 className={styles.logo}>LinguaLife</h1>
        <p className={styles.subtitle}>Introduce tu PIN para acceder</p>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <PinInput onSubmit={handlePin} loading={loading} />
        <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Plataforma Unificada
          </p>
        </div>
      </div>
    </div>
  )
}
