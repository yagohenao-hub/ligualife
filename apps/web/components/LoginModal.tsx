import { useState } from 'react'
import { useRouter } from 'next/router'
import { PinInput } from '@/components/PinInput'
import { useAppContext } from '@/context/AppContext'
import styles from '@/styles/Home.module.css'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter()
  const { setAppState } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

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
        setError(data.error || 'PIN inválido. Verifica tus credenciales.')
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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }} onClick={onClose}>
      <div 
        className={`glass ${styles.card}`} 
        style={{ width: '100%', maxWidth: '420px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            fontSize: '1.25rem',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h2 className={styles.logo} style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>LinguaLife</h2>
        <p className={styles.subtitle} style={{ marginBottom: '1.5rem' }}>Introduce tu PIN de Alumno o Profesor</p>
        
        {error && <div className={styles.errorMessage} style={{ marginBottom: '1rem' }}>{error}</div>}
        
        <PinInput onSubmit={handlePin} loading={loading} />
      </div>
    </div>
  )
}
