import { createContext, useContext, useState, ReactNode } from 'react'
import type { AuthTeacher, Session, Student, Topic, Exercise } from '@/types'

interface AppState {
  teacher: AuthTeacher | null
  currentSession: Session | null
  student: Student | null
  topic: Topic | null
  exercises: Exercise[]
}

interface AppContextValue {
  state: AppState
  setAppState: (patch: Partial<AppState>) => void
}

const initialState: AppState = {
  teacher: null,
  currentSession: null,
  student: null,
  topic: null,
  exercises: [],
}

const AppContext = createContext<AppContextValue>({
  state: initialState,
  setAppState: () => {},
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState)

  function setAppState(patch: Partial<AppState>) {
    setState((prev) => ({ ...prev, ...patch }))
  }

  return (
    <AppContext.Provider value={{ state, setAppState }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
