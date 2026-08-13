import type { Topic } from '@/types'
import styles from './TopicPanel.module.css'

interface Props {
  topic: Topic | null
}

export function TopicPanel({ topic }: Props) {
  if (!topic) return null

  return (
    <div className={`glass ${styles.panel}`}>
      <h3 className={styles.title}>Tópico curricular</h3>
      <p className={styles.topicName}>{topic.title}</p>
      {topic.description && <p className={styles.description}>{topic.description}</p>}
      <div className={styles.meta}>
        {topic.level && <span className={styles.badge}>{topic.level}</span>}
        {topic.order && <span className={styles.order}>#{topic.order}</span>}
      </div>
    </div>
  )
}
