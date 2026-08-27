import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '@/styles/Register.module.css'
import { COUNTRIES } from '@/lib/countries'

const GOALS = [
  { id: 'rectE12LwYtTeBoKV', name: 'General (English for Everyday Life)' },
  { id: 'recVYlMlMhHK9XGxo', name: 'Business (English for Career & Work)' },
  { id: 'recqioqL5XXSvMi4F', name: 'B2 to C1 (Advanced Mastery)' },
  { id: 'recG8y2MTbh8w1irB', name: 'Travel & Culture (English for the World)' },
  { id: 'recIiDTxgYE0NCkmW', name: 'Marketing & Digital World' }
]

const INTERESTS = [
  "Startups & Emprendimiento", "Marketing Digital & Redes", "Inversiones, Crypto & Finanzas", 
  "Inteligencia Artificial & Tech", "Liderazgo & Gestión de Equipos", "Programación & Software", 
  "Cine, Series & Streaming", "Música, Festivales & Conciertos", "Videojuegos & Gaming", 
  "Literatura & Libros", "Arte, Diseño & Arquitectura", "Gastronomía & Cocina", 
  "Fitness & Gym", "Yoga & Mindfulness", "Deportes", "Nutrición", 
  "Noticias de Actualidad", "Historia & Política", "Ciencia"
]

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']

export default function StudentRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedPin, setGeneratedPin] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneCode: '+57',
    phoneNumber: '',
    country: 'Colombia',
    ageRange: '',
    goalId: '',
    interests: [] as string[],
    openToGroups: false,
    acceptTerms: false,
  })

  // Calendar State
  const [availability, setAvailability] = useState<boolean[][]>(
    () => Array.from({ length: HOURS.length }, () => Array(DAYS.length).fill(false))
  )
  const [globalAvail, setGlobalAvail] = useState<boolean[][] | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(false)

  useEffect(() => {
    if (step === 4 && !globalAvail) {
      fetch('/api/register/global-availability')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setGlobalAvail(data)
        })
        .catch(console.error)
    }
  }, [step, globalAvail])

  useEffect(() => {
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleUp)
    return () => window.removeEventListener('mouseup', handleUp)
  }, [])

  function updateCell(row: number, col: number, value: boolean) {
    setAvailability(prev => {
      if (prev[row][col] === value) return prev
      const next = prev.map(r => [...r])
      next[row][col] = value
      return next
    })
  }

  function handleMouseDown(row: number, col: number) {
    const newValue = !availability[row][col]
    setDragValue(newValue)
    setIsDragging(true)
    updateCell(row, col, newValue)
  }

  function handleMouseEnter(row: number, col: number) {
    if (isDragging) {
      updateCell(row, col, dragValue)
    }
  }

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/register/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: `${formData.phoneCode} ${formData.phoneNumber}`,
          timezone: COUNTRIES.find(c => c.name === formData.country)?.timezone || 'UTC',
          availability: JSON.stringify(availability)
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en el registro')

      if (data.pin) setGeneratedPin(data.pin)
      setStep(5) // Success step
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Registro Alumno | LinguaLife</title>
      </Head>

      <div className={styles.card}>
        <div className={styles.stepIndicator}>
          {[1, 2, 3].map(num => (
            <div key={num} className={`${styles.dot} ${step === num ? styles.dotActive : step > num ? styles.dotCompleted : ''}`} />
          ))}
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        {step === 1 && (
          <div>
            <h1 className={styles.title}>¡Bienvenido a LinguaLife!</h1>
            <p className={styles.subtitle}>Comencemos configurando tu perfil.</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre completo</label>
              <input 
                className={styles.input}
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                placeholder="Ej. Santiago Montes"
                required
              />
              {formData.fullName && formData.fullName.trim().split(/\s+/).length < 2 && (
                <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.25rem' }}>Ingresa al menos dos nombres</p>
              )}
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <input 
                className={styles.input}
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="santiago@ejemplo.com"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>País de Residencia</label>
                <select 
                  className={`${styles.input} ${styles.selectInput}`}
                  value={formData.country}
                  onChange={e => {
                    const c = COUNTRIES.find(x => x.name === e.target.value)
                    setFormData({
                      ...formData, 
                      country: e.target.value,
                      phoneCode: c ? c.code : formData.phoneCode
                    })
                  }}
                >
                  {COUNTRIES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup} style={{ flex: 2 }}>
                <label className={styles.label}>WhatsApp</label>
                <div className={styles.phoneWrapper}>
                  <input 
                    className={`${styles.input} ${styles.codeTyped}`}
                    value={formData.phoneCode}
                    onChange={e => setFormData({...formData, phoneCode: e.target.value})}
                  />
                  <input 
                    className={styles.input}
                    style={{ flex: 1 }}
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="320 000 0000"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Rango de Edad</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label className={`${styles.radioLabel} ${formData.ageRange === '4-13' ? styles.radioLabelActive : ''}`} style={{ flex: 1 }}>
                  <input 
                    type="radio" 
                    name="ageRange" 
                    className={styles.radioInput}
                    checked={formData.ageRange === '4-13'}
                    onChange={() => setFormData({...formData, ageRange: '4-13'})}
                  />
                  Niños (4-13 años)
                </label>
                <label className={`${styles.radioLabel} ${formData.ageRange === '14+' ? styles.radioLabelActive : ''}`} style={{ flex: 1 }}>
                  <input 
                    type="radio" 
                    name="ageRange" 
                    className={styles.radioInput}
                    checked={formData.ageRange === '14+'}
                    onChange={() => setFormData({...formData, ageRange: '14+'})}
                  />
                  Jóvenes/Adultos (14+)
                </label>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={formData.acceptTerms}
                  onChange={e => setFormData({...formData, acceptTerms: e.target.checked})}
                  style={{ marginTop: '0.2rem', width: '16px', height: '16px', accentColor: '#10b981' }}
                />
                <span>
                  He leído y acepto los <a href="/terms" target="_blank" style={{ color: '#10b981', textDecoration: 'underline' }}>Términos de Servicio</a> y la <a href="/privacy" target="_blank" style={{ color: '#10b981', textDecoration: 'underline' }}>Política de Privacidad</a> (incluyendo el tratamiento de datos para el uso de WhatsApp e Inteligencia Artificial).
                </span>
              </label>
            </div>

            <div className={styles.footer}>
              <div />
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleNext}
                disabled={
                  formData.fullName.trim().split(/\s+/).length < 2 || 
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || 
                  !/^\d+$/.test(formData.phoneNumber.replace(/\s+/g, '')) || 
                  !formData.ageRange ||
                  !formData.acceptTerms
                }
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className={styles.title}>Tu Objetivo Principal</h1>
            <p className={styles.subtitle}>¿Para qué necesitas mejorar tu inglés ahora mismo?</p>

            <div className={styles.radioGroup}>
              {GOALS.map(goal => (
                <label key={goal.id} className={`${styles.radioLabel} ${formData.goalId === goal.id ? styles.radioLabelActive : ''}`}>
                  <input 
                    type="radio" 
                    name="goal" 
                    className={styles.radioInput}
                    checked={formData.goalId === goal.id}
                    onChange={() => setFormData({...formData, goalId: goal.id})}
                  />
                  {goal.name}
                </label>
              ))}
            </div>

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleNext}
                disabled={!formData.goalId}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className={styles.title}>¿De qué te gusta hablar?</h1>
            <p className={styles.subtitle}>Selecciona al menos 5 temas que te apasionen para personalizar tus clases.</p>

            <div className={styles.interestsGrid}>
              {INTERESTS.map(interest => {
                const isSelected = formData.interests.includes(interest)
                return (
                  <button 
                    key={interest}
                    className={`${styles.interestBtn} ${isSelected ? styles.interestBtnActive : ''}`}
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleSubmit}
                disabled={loading || formData.interests.length < 5}
              >
                {loading 
                  ? 'Registrando...' 
                  : formData.interests.length < 5 
                    ? `Selecciona ${5 - formData.interests.length} más` 
                    : 'Finalizar Registro'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 className={styles.title}>¡Registro Exitoso!</h1>

            {generatedPin && (
              <div style={{
                margin: '1.5rem auto',
                padding: '1.25rem 2rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                maxWidth: '320px'
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
                  Tu PIN de acceso es:
                </p>
                <p style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  letterSpacing: '0.25em',
                  color: '#10b981',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {generatedPin}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0' }}>
                  Guárdalo en un lugar seguro. Lo necesitarás para iniciar sesión.
                </p>
              </div>
            )}

            <p className={styles.subtitle}>
              Hemos recibido tu información y tu PIN ha sido generado. Estás a un paso de comenzar tu aventura con LinguaLife.<br /><br />
              Por favor, confirma tu registro o comunícate con tu asesor para activar tus clases privadas.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => router.push('/login')}
              >
                Acceder a mi Portal con PIN 🔑
              </button>

              <a
                href={`https://wa.me/573210000000?text=Hola,%20acabo%20de%20registrarme%20en%20LinguaLife%20con%20el%20PIN%20${generatedPin}`}
                target="_blank"
                rel="noreferrer"
                className={`${styles.btn} ${styles.btnSecondary}`}
                style={{ textDecoration: 'none', background: '#25D366', color: '#fff', border: 'none' }}
              >
                💬 Abrir WhatsApp con mi Asesor
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
