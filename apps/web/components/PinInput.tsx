import { useState } from 'react'
import styles from './PinInput.module.css'

interface Props {
  onSubmit: (pin: string) => void
  loading?: boolean
}

export function PinInput({ onSubmit, loading }: Props) {
  const [pin, setPin] = useState('')

  function handleSubmit() {
    if (pin.length >= 4) onSubmit(pin)
  }

  return (
    <div className={styles.container}>
      <input
        type="password"
        inputMode="numeric"
        placeholder="Ingresa tu PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className={styles.input}
        maxLength={8}
      />
      <button
        onClick={handleSubmit}
        disabled={loading || pin.length < 4}
        className={styles.button}
      >
        {loading ? 'Validando...' : 'Entrar'}
      </button>
    </div>
  )
}
