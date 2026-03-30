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
          {[1, 2, 3, 4].map(num => (
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
              />
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

            <div className={styles.footer}>
              <div />
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleNext}
                disabled={!formData.fullName || !formData.email || !formData.phoneNumber || !formData.ageRange}
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
                onClick={handleNext}
                disabled={formData.interests.length < 5}
              >
                {formData.interests.length < 5 
                  ? `Selecciona ${5 - formData.interests.length} más` 
                  : 'Siguiente'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className={styles.title}>Disponibilidad Ideal</h1>
            <p className={styles.subtitle}>Haz clic y arrastra sobre los bloques donde te gustaría tener clase.</p>

            {globalAvail && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border-glass)' }}>
                💡 <strong style={{ color: '#10b981' }}>Sugerencia:</strong> Los bloques con borde verde indican horarios donde ya tenemos profesores disponibles. Si eliges estos, tu inicio será más inmediato.
              </div>
            )}

            <div className={styles.availGrid} style={{ userSelect: 'none' }}>
              <div className={styles.availDayRow}>
                <div className={styles.availHourLabel} />
                {DAYS.map(d => (
                  <div key={d} className={styles.availDayLabel}>{d}</div>
                ))}
              </div>
              {HOURS.map((hour, row) => (
                <div key={hour} className={styles.availDayRow}>
                  <div className={styles.availHourLabel}>{hour}</div>
                  {DAYS.map((_, col) => {
                    const isSelected = availability[row]?.[col]
                    const isTeacherAvailable = globalAvail?.[row]?.[col]
                    return (
                      <div
                        key={col}
                        className={`${styles.availCell} ${isSelected ? styles.availCellSelected : ''} ${isTeacherAvailable ? styles.availCellGlobal : ''}`}
                        onMouseDown={() => handleMouseDown(row, col)}
                        onMouseEnter={() => handleMouseEnter(row, col)}
                        title={isTeacherAvailable ? "Profesor disponible en este horario" : "Horario solicitado bajo demanda"}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.5rem 0'
                }} 
                onClick={() => setFormData({...formData, openToGroups: !formData.openToGroups})}
              >
                <div style={{ 
                  position: 'relative', 
                  width: '36px', 
                  height: '20px', 
                  background: formData.openToGroups ? '#10b981' : '#4b5563', 
                  borderRadius: '100px', 
                  transition: 'all 0.3s ease', 
                  flexShrink: 0 
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: '2px', 
                    left: formData.openToGroups ? '18px' : '2px', 
                    width: '16px', 
                    height: '16px', 
                    background: '#fff', 
                    borderRadius: '50%', 
                    transition: 'all 0.3s ease' 
                  }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Voy a tomar clases grupales con personas de todo el país
                </span>
              </div>

              {formData.openToGroups && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '1rem', 
                  background: 'rgba(16, 185, 129, 0.05)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)', 
                  borderRadius: '10px', 
                  fontSize: '0.8rem', 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.4'
                }}>
                  ✨ <strong>Modalidad Grupal:</strong> Activa esta opción solo si deseas compartir tus sesiones con otros estudiantes en Colombia. Buscaremos compañeros con **intereses similares** para enriquecer tu aprendizaje y ofrecerte mayor flexibilidad horaria.
                </div>
              )}
            </div>

            {(() => {
              const selectedOnes = []
              for(let r=0; r<HOURS.length; r++) {
                for(let c=0; c<DAYS.length; c++) {
                  if (availability[r][c]) selectedOnes.push({r,c})
                }
              }
              const onlyUnavailable = selectedOnes.length > 0 && selectedOnes.every(s => !globalAvail?.[s.r]?.[s.c])
              
              if (onlyUnavailable) {
                return (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#fbbf24' }}>
                    ⚠️ <strong>Nota:</strong> Los horarios que seleccionaste no cuentan con disponibilidad inmediata actualmente. Puedes continuar con el registro, pero deberás esperar a que busquemos un profesor que se ajuste a tu tiempo. Te avisaremos apenas lo consigamos.
                  </div>
                )
              }
              return null
            })()}

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleSubmit}
                disabled={loading || availability.flat().every(v => !v)}
              >
                {loading ? 'Enviando...' : 'Finalizar Registro'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 className={styles.title}>¡Registro Exitoso!</h1>
            <p className={styles.subtitle}>
              Hemos recibido tu información. Estás a un paso de comenzar tu aventura con LinguaLife.<br /><br />
              Por favor, envía el comprobante de pago a tu asesor asignado para activar tu cuenta y agendar tus primeras clases.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
