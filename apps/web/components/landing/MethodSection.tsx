import { InteractiveSceneViewer } from '@/components/InteractiveSceneViewer'
import styles from '@/styles/Landing.module.css'

export function MethodSection() {
  const CURRICULUM_HIGHLIGHTS = [
    { order: 1, title: 'Talking about Yesterday', level: 'A2+', lds: 'Sujeto + Did + Acción' },
    { order: 12, title: 'Polite Requests & Business Needs', level: 'B1+', lds: 'Would / Could + Action' },
    { order: 25, title: 'Hypothetical Situations & Strategy', level: 'B2', lds: 'If + Past, Would + Have' },
    { order: 40, title: 'Negotiations & Counter-Offers', level: 'B2+', lds: 'Provided that / Unless' },
    { order: 55, title: 'Executive Storytelling & Pitching', level: 'C1', lds: 'Advanced Rhetoric & Tone' },
    { order: 60, title: 'Full Native Fluency Mastery', level: 'C1', lds: 'Nuanced Business English' },
  ]

  return (
    <section id="metodo" className={styles.section} style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Ingeniería de Aprendizaje</span>
          <h2 className={styles.sectionTitle}>El Método LDS: Tu Atajo Lógico hacia el B2</h2>
          <p className={styles.sectionSubtitle}>
            No memorizas listas estériles. Aprendes las estructuras lógicas de la oración en inglés (LDS) y las combinas con vocabulario relevante para tu carrera.
          </p>
        </div>

        <div className={styles.grid3} style={{ marginBottom: '4rem' }}>
          <div className={styles.cardFeature}>
            <div className={styles.featureIcon}>🎯</div>
            <h3 className={styles.featureTitle}>Malla Unificada de 60 Pasos</h3>
            <p className={styles.featureDesc}>
              Un mapa claro sin rodeos. Sabes exactamente en qué tema estás (ej. Tema #14) y cuántos pasos te faltan para alcanzar tu meta B2.
            </p>
          </div>

          <div className={styles.cardFeature}>
            <div className={styles.featureIcon}>👨‍🏫</div>
            <h3 className={styles.featureTitle}>Clases 1-a-1 con Copiloto IA</h3>
            <p className={styles.featureDesc}>
              Tu profesor en vivo utiliza un panel inteligente que le sugiere ejercicios, diapositivas y correcciones fonéticas en tiempo real según tu ritmo.
            </p>
          </div>

          <div className={styles.cardFeature}>
            <div className={styles.featureIcon}>📱</div>
            <h3 className={styles.featureTitle}>Pocket Coach en WhatsApp 24/7</h3>
            <p className={styles.featureDesc}>
              La práctica no termina en la clase. Tu profesor e IA envían retos diarios de voz a tu WhatsApp para que nunca pierdas el impulso.
            </p>
          </div>
        </div>

        {/* Interactive Waldo Scene Preview */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px', textTransform: 'uppercase' }}>
              NUEVO • Taller de Vocabulario Visual B2
            </span>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.5rem 0' }}>
              Explora la Escena Interactiva "Buscando a Waldo"
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.925rem' }}>
              Haz clic en los personajes de la oficina para escuchar cómo se pronuncian sus acciones en contexto real.
            </p>
          </div>

          <InteractiveSceneViewer />
        </div>
        <div style={{ background: 'rgba(18, 18, 24, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '2.5rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Muestrario de la Malla Curricular (Pasos 1 al 60)
            </h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
              Cada lección combina una fórmula gramatical LDS clara con tu sesgo de vocabulario preferido.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {CURRICULUM_HIGHLIGHTS.map(c => (
              <div 
                key={c.order}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7c3aed', background: 'rgba(124,58,237,0.15)', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      Tema #{c.order}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                      Nivel {c.level}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#f4f4f5' }}>
                    {c.title}
                  </h4>
                </div>
                <div style={{ fontSize: '0.775rem', color: '#9ca3af', fontStyle: 'italic', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                  Fórmula LDS: {c.lds}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
