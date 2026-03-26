import type { Exercise } from '@/types'
import styles from './ExerciseCard.module.css'

interface Props {
  exercise: Exercise
}

export function ExerciseCard({ exercise }: Props) {
  return (
    <div className={`glass ${styles.card}`}>
      <p className={styles.example}>"{exercise.generatedExample}"</p>
      {exercise.solutionArchetype && (
        <small className={styles.solution}>{exercise.solutionArchetype}</small>
      )}
    </div>
  )
}
