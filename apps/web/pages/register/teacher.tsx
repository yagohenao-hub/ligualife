import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '@/styles/Register.module.css'
import { COUNTRIES } from '@/lib/countries'

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

export default function TeacherRegistration() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCode: '+57',
    phoneNumber: '',
    country: 'Colombia',
    llaveBreB: false,
    llave: '',
    bankName: '',
    accountType: '',
    accountNumber: '',
    idNumber: '',
    interests: [] as string[]
  })

  // Calendar State
  const [availability, setAvailability] = useState<boolean[][]>(
    () => Array.from({ length: HOURS.length }, () => Array(DAYS.length).fill(false))
  )
  const [communityAvail, setCommunityAvail] = useState<{ teachersCover: number[][], studentDemand: number[][] } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragValue, setDragValue] = useState(false)

  useEffect(() => {
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleUp)
    return () => window.removeEventListener('mouseup', handleUp)
  }, [])

  useEffect(() => {
    if (step === 3 && !communityAvail) {
      fetch('/api/register/community-availability')
        .then(res => res.json())
        .then(setCommunityAvail)
        .catch(console.error)
    }
  }, [step, communityAvail])

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
    
    let bankData = {}
    if (formData.llaveBreB) {
      bankData = { Key: formData.llave, Type: "Llave Bre-B", ID: formData.idNumber }
    } else {
      bankData = {
        Bank: formData.bankName,
        AccountType: formData.accountType,
        AccountNumber: formData.accountNumber,
        ID: formData.idNumber
      }
    }

    try {
      const res = await fetch('/api/register/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: `${formData.phoneCode} ${formData.phoneNumber}`,
          timezone: COUNTRIES.find(c => c.name === formData.country)?.timezone || 'UTC',
          bankDetails: JSON.stringify(bankData, null, 2),
          availability: JSON.stringify(availability)
        })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error en el registro')
      
      setStep(5)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Registro Profesor | LinguaLife</title>
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
            <h1 className={styles.title}>Postulación a Profesor</h1>
            <p className={styles.subtitle}>Cuéntanos sobre ti para iniciar tu proceso de onboarding.</p>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre completo</label>
              <input 
                className={styles.input}
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Yago Henao"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <input 
                className={styles.input}
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="profesor@ejemplo.com"
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
              <div className={styles.formGroup} style={{ flex: 1.5 }}>
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

            <div className={styles.footer}>
              <div />
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleNext}
                disabled={!formData.name || !formData.email || !formData.phoneNumber}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className={styles.title}>Tus Intereses</h1>
            <p className={styles.subtitle}>Selecciona los temas que más te apasionan. Esto nos ayudará a conectarte con los mejores alumnos para ti.</p>

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
                disabled={formData.interests.length < 3}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className={styles.title}>Disponibilidad Semanal</h1>
            <p className={styles.subtitle}>Selecciona los bloques horarios que puedes dedicar a LinguaLife.</p>

            {communityAvail && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 12, height: 12, border: '1px solid #10b981', borderRadius: '2px' }} />
                  <span>Sugerido (Alta competencia)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ width: 12, height: 12, border: '2px solid #8b5cf6', borderRadius: '2px', boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' }} />
                  <span style={{ color: '#c084fc', fontWeight: 600 }}>¡Urgente! (Alumnos esperando en este horario)</span>
                </div>
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
                    const teacherCount = communityAvail?.teachersCover[row]?.[col] || 0
                    const studentWaiting = communityAvail?.studentDemand[row]?.[col] || 0
                    
                    let hintClass = ''
                    if (studentWaiting > 0) hintClass = styles.availCellDemand
                    else if (teacherCount > 0) hintClass = styles.availCellGlobal

                    return (
                      <div
                        key={col}
                        className={`${styles.availCell} ${isSelected ? styles.availCellSelected : ''} ${hintClass}`}
                        onMouseDown={() => handleMouseDown(row, col)}
                        onMouseEnter={() => handleMouseEnter(row, col)}
                        title={`${teacherCount} profesores activos, ${studentWaiting} alumnos esperando`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleNext}
                disabled={loading || availability.flat().every(v => !v)}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className={styles.title}>Datos de Pago</h1>
            <p className={styles.subtitle}>¿A dónde enviaremos tus pagos por las clases?</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Número de Identificación</label>
              <input 
                className={styles.input}
                value={formData.idNumber}
                onChange={e => setFormData({...formData, idNumber: e.target.value})}
                placeholder="Ej. 1000000000"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Tengo Llave Bre-B</span>
              <label className={styles.toggleSwitch}>
                <input 
                  type="checkbox" 
                  checked={formData.llaveBreB} 
                  onChange={e => setFormData({...formData, llaveBreB: e.target.checked})} 
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            {formData.llaveBreB ? (
              <div className={styles.formGroup}>
                <label className={styles.label}>Escribe tu llave Bre-B</label>
                <input 
                  className={styles.input}
                  value={formData.llave}
                  onChange={e => setFormData({...formData, llave: e.target.value})}
                  placeholder="Número de celular asociado..."
                />
              </div>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nombre del Banco</label>
                  <input 
                    className={styles.input}
                    value={formData.bankName}
                    onChange={e => setFormData({...formData, bankName: e.target.value})}
                    placeholder="Ej. Bancolombia"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Cuenta</label>
                  <select 
                    className={styles.input}
                    value={formData.accountType}
                    onChange={e => setFormData({...formData, accountType: e.target.value})}
                  >
                    <option value="">Selecciona...</option>
                    <option value="Ahorros">Ahorros</option>
                    <option value="Corriente">Corriente</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Número de Cuenta</label>
                  <input 
                    className={styles.input}
                    value={formData.accountNumber}
                    onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                    placeholder="Ej. 1234567890"
                  />
                </div>
              </>
            )}

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`} 
                onClick={handleSubmit}
                disabled={loading || !formData.idNumber || (formData.llaveBreB ? !formData.llave : !formData.accountNumber)}
              >
                {loading ? 'Enviando...' : 'Finalizar Registro'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h1 className={styles.title}>¡Aplicación Enviada!</h1>
            <p className={styles.subtitle}>
              Estudiaremos tu perfil y nos pondremos en contacto contigo. Si se aprueba tu perfil, se te generará un PIN para acceder al dashboard de Teacher Copilot.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
