import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
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

const ID_TYPES = [
  "Cédula de Ciudadanía",
  "Cédula de Extranjería",
  "Pasaporte",
  "NIT",
  "Tarjeta de Identidad",
  "Permiso por Protección Temporal (PPT)",
]

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HOURS = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm']

// COP per hour if all blocks are filled — adjust as needed
const HOURLY_RATE_COP = 28000

export default function TeacherRegistration() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneCode: '+57',
    phoneNumber: '',
    country: 'Colombia',
    idType: '',
    idNumber: '',
    llaveBreB: false,
    llave: '',
    bankName: '',
    accountType: '',
    accountNumber: '',
    interests: [] as string[],
    ssDocumentData: '',   // base64
    ssDocumentName: '',
    ssDocumentType: '',
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip data URL prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1] || ''
      setFormData(prev => ({
        ...prev,
        ssDocumentData: base64,
        ssDocumentName: file.name,
        ssDocumentType: file.type,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    let bankData: Record<string, string> = { ID: formData.idNumber, IDType: formData.idType }
    if (formData.llaveBreB) {
      bankData = { ...bankData, Key: formData.llave, Type: "Llave Bre-B" }
    } else {
      bankData = {
        ...bankData,
        Bank: formData.bankName,
        AccountType: formData.accountType,
        AccountNumber: formData.accountNumber,
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
          availability: JSON.stringify(availability),
        })
      })

      const data = await res.json()
      if (!res.ok) {
        // Surface Airtable error detail if present
        const detail = data.details?.error?.message || data.details?.message || ''
        throw new Error(detail || data.error || 'Error en el registro')
      }

      setStep(6)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Income calculator
  const selectedSlots = availability.flat().filter(Boolean).length
  const monthlyEstimate = selectedSlots * HOURLY_RATE_COP * 4

  return (
    <div className={styles.container}>
      <Head>
        <title>Registro Profesor | LinguaLife</title>
      </Head>

      <div className={styles.card}>
        <div className={styles.stepIndicator}>
          {[1, 2, 3, 4, 5].map(num => (
            <div key={num} className={`${styles.dot} ${step === num ? styles.dotActive : step > num ? styles.dotCompleted : ''}`} />
          ))}
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        {/* ── STEP 1: Datos personales ── */}
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
                placeholder="Ej. Camila Rodríguez Torres"
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

        {/* ── STEP 2: Intereses ── */}
        {step === 2 && (
          <div>
            <h1 className={styles.title}>Tus Intereses</h1>
            <p className={styles.subtitle}>Selecciona mínimo 5 temas que más te apasionan. Esto nos ayudará a conectarte con los mejores alumnos para ti.</p>

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

            <p style={{ fontSize: '0.82rem', color: formData.interests.length >= 5 ? '#10b981' : 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.5rem' }}>
              {formData.interests.length}/5 seleccionados mínimo
            </p>

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleNext}
                disabled={formData.interests.length < 5}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Disponibilidad + calculadora ── */}
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

            {/* Income calculator */}
            {selectedSlots > 0 && (
              <div className={styles.incomeCalc}>
                <div className={styles.incomeCalcRow}>
                  <span>⏱ Bloques seleccionados</span>
                  <strong>{selectedSlots} hrs/semana</strong>
                </div>
                <div className={styles.incomeCalcRow}>
                  <span>💰 Ingreso máximo estimado</span>
                  <strong style={{ color: '#10b981' }}>
                    ~${monthlyEstimate.toLocaleString('es-CO')} COP/mes
                  </strong>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.4rem', marginBottom: 0 }}>
                  Si todos tus bloques se llenan. Basado en ${HOURLY_RATE_COP.toLocaleString('es-CO')} COP/hora.
                </p>
              </div>
            )}

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

        {/* ── STEP 4: Seguridad Social ── */}
        {step === 4 && (
          <div>
            <h1 className={styles.title}>Documentación de Seguridad Social</h1>
            <p className={styles.subtitle}>La SS es obligatoria y se renueva mensualmente. Súbela ahora para comenzar sin contratiempos.</p>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sube tu documento SS (imagen o PDF)</label>

              {/* Hidden native input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <div
                className={`${styles.fileDropZone} ${formData.ssDocumentName ? styles.fileDropZoneActive : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.ssDocumentName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {formData.ssDocumentType === 'application/pdf' ? '📄' : '🖼️'}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all', textAlign: 'center' }}>
                      {formData.ssDocumentName}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#10b981' }}>✓ Archivo listo para subir</span>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFormData(p => ({ ...p, ssDocumentData: '', ssDocumentName: '', ssDocumentType: '' })) }}
                      style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.2rem' }}
                    >
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '2rem' }}>📎</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Haz clic para subir</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Imagen (JPG, PNG) o PDF · Máx. 10 MB</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '1rem', marginTop: '0.5rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#34d399', margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <span>📅</span>
                <span>
                  <strong>Vencimiento automático:</strong> La fecha de vencimiento de tu SS se calculará como 30 días desde tu activación como profesor, y se requerirá cada mes. Recibirás un aviso 3 días antes de que venza.
                </span>
              </p>
            </div>

            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '10px', padding: '1rem', marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#fbbf24', margin: 0 }}>
                ⚠️ <strong>Importante:</strong> Sin la SS activa no podrás dar clases el siguiente mes. Puedes continuar sin subirla ahora y actualizarla desde tu Studio.
              </p>
            </div>

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleNext}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Datos de pago ── */}
        {step === 5 && (
          <div>
            <h1 className={styles.title}>Datos de Pago</h1>
            <p className={styles.subtitle}>¿A dónde enviaremos tus pagos por las clases?</p>

            {/* ID type + number side by side */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className={styles.formGroup} style={{ flex: 1 }}>
                <label className={styles.label}>Tipo de documento</label>
                <select
                  className={`${styles.input} ${styles.selectInput}`}
                  value={formData.idType}
                  onChange={e => setFormData({...formData, idType: e.target.value})}
                >
                  <option value="">Selecciona...</option>
                  {ID_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup} style={{ flex: 1.4 }}>
                <label className={styles.label}>Número de documento</label>
                <input
                  className={styles.input}
                  value={formData.idNumber}
                  onChange={e => setFormData({...formData, idNumber: e.target.value})}
                  placeholder="Ej. 1020345678"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
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
                <label className={styles.label}>Número de celular Bre-B</label>
                <input
                  className={styles.input}
                  value={formData.llave}
                  onChange={e => setFormData({...formData, llave: e.target.value})}
                  placeholder="Ej. 3201234567"
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
                    placeholder="Ej. Bancolombia, Davivienda, Nequi..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de Cuenta</label>
                  <select
                    className={`${styles.input} ${styles.selectInput}`}
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
                    placeholder="Ej. 69812345678"
                  />
                </div>
              </>
            )}

            <div className={styles.footer}>
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBack}>Atrás</button>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleSubmit}
                disabled={loading || !formData.idType || !formData.idNumber || (formData.llaveBreB ? !formData.llave : !formData.accountNumber)}
              >
                {loading ? 'Enviando...' : 'Finalizar Registro'}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 6: Confirmación ── */}
        {step === 6 && (
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
