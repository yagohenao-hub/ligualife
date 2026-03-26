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
    setSession(JSON.parse(raw) as AuthSession)
  }, [])

  return session
}
