import type { Session } from '@/types'
import styles from './SessionCard.module.css'

interface Props {
  session: Session
  onClick: (session: Session) => void
  onReschedule?: (session: Session) => void
  onConfirmHoliday?: (session: Session) => void
  role?: 'teacher' | 'student'
}

export function SessionCard({ session, onClick, onReschedule, onConfirmHoliday, role }: Props) {
  const isConfirmedByMe = role === 'teacher' ? session.holidayConfirmedTeacher : session.holidayConfirmedStudent
  const isHoliday = session.isHoliday
  const isGhost = isHoliday && session.status === 'Canceled'

  return (
    <div className={`glass ${styles.card} ${isGhost ? styles.ghost : ''}`} onClick={() => !isGhost && onClick(session)} role="button">
      <div className={styles.info}>
        <div className={styles.headerRow}>
          <h4 className={styles.name}>{session.sessionName || 'Sesión'}</h4>
          {isHoliday && <span className={styles.holidayBadge}>Festivo 🇨🇴</span>}
        </div>
        <div className={styles.meta}>
          <span className={styles.time}>{session.time}</span>
          {session.topicName && <span className={styles.topic}>— {session.topicName}</span>}
        </div>
        {isGhost && (
          <div className={styles.holidayWarning}>
            <div className={styles.ghostStatus}>✧ Sesión en espera de confirmación</div>
            <p className={styles.ghostText}>Esta clase solo se activará si tú y el {role === 'teacher' ? 'alumno' : 'profesor'} confirman interés.</p>
            {onConfirmHoliday && (
              <button 
                className={styles.confirmBtn} 
                onClick={(e) => { e.stopPropagation(); onConfirmHoliday(session); }}
                disabled={isConfirmedByMe}
              >
                {isConfirmedByMe ? '✓ Esperando al otro...' : 'Confirmar asistencia'}
              </button>
            )}
            <div className={styles.statusConfirm}>
              Participantes: {session.holidayConfirmedTeacher ? '✅ Prof' : '⏳ Prof'} | {session.holidayConfirmedStudent ? '✅ Alum' : '⏳ Alum'}
            </div>
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {!isGhost && session.status === 'Scheduled' && onReschedule && (
          <button 
// ... (rest of buttons)
            className={styles.rescheduleBtn}
            onClick={(e) => {
              e.stopPropagation()
              onReschedule(session)
            }}
            title="Reagendar sesión"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
              <path d="M16 16h5v5"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
