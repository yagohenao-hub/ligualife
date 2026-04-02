// Teacher: full Airtable record (server-side only)
export interface Teacher {
  id: string
  name: string
  pin: string
}

// AuthTeacher: stored in AppContext and sessionStorage (no pin)
export interface AuthTeacher {
  id: string
  name: string
}

export interface Session {
  id: string
  teacherId: string
  studentId: string
  topicId: string | null
  date: string       // ISO 8601 e.g. "2026-03-23"
  time: string       // "HH:MM"
  status: string
  sessionName: string
  topicName?: string | null
  isHoliday?: boolean
  holidayConfirmedTeacher?: boolean
  holidayConfirmedStudent?: boolean
}

export interface Student {
  id: string
  name: string
  level?: string
  vertical?: string
  notes?: string
  interests?: string
  progressIds?: string[]
  'Tokens de Reposición'?: number
}

export interface Topic {
  id: string
  title: string
  description: string
  level: string
  order?: number
  ldsFormula?: string
  aiContext?: string
  fase?: string
}

export interface Exercise {
  id: string
  studentId: string
  generatedExample: string
  solutionArchetype?: string
  date: string       // ISO 8601
}
