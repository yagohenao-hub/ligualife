import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export interface AuthSession {
  teacherId: string
  name: string
}

export function useRequireAuth(): AuthSession | null {
  const router = useRouter()
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('lingualife_session')
    if (!raw) {
      router.replace('/')
      return
    }
    try {
      setSession(JSON.parse(raw) as AuthSession)
    } catch {
      sessionStorage.removeItem('lingualife_session')
      router.replace('/')
    }
  }, [])

  return session
}
