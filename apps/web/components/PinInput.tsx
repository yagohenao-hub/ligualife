import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import styles from './PinInput.module.css'

interface Props {
  onSubmit: (pin: string) => void
  loading?: boolean
}

export function PinInput({ onSubmit, loading }: Props) {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(true)

  function handleSubmit() {
    if (pin.trim().length >= 4) onSubmit(pin.trim())
  }

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <input
          type={showPin ? 'text' : 'password'}
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          placeholder="Ingresa tu PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className={styles.input}
          maxLength={10}
        />
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowPin(!showPin)}
          title={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
          aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
        >
          {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || pin.trim().length < 4}
        className={styles.button}
      >
        {loading ? 'Validando...' : 'Entrar'}
      </button>
    </div>
  )
}
