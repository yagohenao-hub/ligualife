import type { Session } from '@/types'
import styles from './SessionCard.module.css'

interface Props {
  session: Session
  onClick: (session: Session) => void
  onReschedule?: (session: Session) => void
}

export function SessionCard({ session, onClick, onReschedule }: Props) {
  return (
    <div className={`glass ${styles.card}`} onClick={() => onClick(session)} role="button">
      <div className={styles.info}>
        <h4 className={styles.name}>{session.sessionName || 'Sesión'}</h4>
        <div className={styles.meta}>
          <span className={styles.time}>{session.time}</span>
          {session.topicName && <span className={styles.topic}>— {session.topicName}</span>}
        </div>
      </div>
      <div className={styles.actions}>
        {session.status === 'Scheduled' && onReschedule && (
          <button 
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
