import Link from 'next/link'
import styles from '@/styles/Landing.module.css'
import { Check, Sparkles, Gift, ArrowRight } from 'lucide-react'

export function PricingSection() {
  return (
    <section id="precios" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Inversión Transparente</span>
          <h2 className={styles.sectionTitle}>Planes Diseñados para Garantizar Tu Fluidez</h2>
          <p className={styles.sectionSubtitle}>
            Sin cláusulas de permanencia ocultas. Elige tu plan y comienza hoy mismo con clases 1-a-1 privadas y tu Pocket Coach 24/7.
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {/* Plan Mensual */}
          <div className={styles.pricingCard}>
            <div>
              <h3 className={styles.planTitle}>Plan Mensual Fluidez</h3>
              <p className={styles.planDesc}>Ideal para avanzar con flexibilidad paso a paso.</p>
              <div className={styles.planPrice}>$280.000 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>COP /mes</span></div>
              <div className={styles.planPeriod}>Facturación mensual cancelable en cualquier momento</div>

              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Clases Privadas 1-a-1 en Vivo con Profesor</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Pocket Coach 24/7 en WhatsApp (Texto + Audios)</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Malla Curricular Unificada de 60 Temas</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Sesgo de Vocabulario Personalizado a tu Carrera</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Tokens de Reposición para Clases Reagendadas</li>
              </ul>
            </div>

            <Link href="/register/student?plan=mensual" className={styles.btnSecondary} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>Inscribirme con Plan Mensual</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Plan Trimestral Destacado */}
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <span className={styles.badgePopular} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={13} />
              <span>Más Popular • 15% Descuento</span>
            </span>
            <div>
              <h3 className={styles.planTitle}>Plan Trimestral Intensivo</h3>
              <p className={styles.planDesc}>Aceleración máxima para alcanzar tu nivel B2 este trimestre.</p>
              <div className={styles.planPrice}>$238.000 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>COP /mes</span></div>
              <div className={styles.planPeriod}>Facturado cada 3 meses ($714.000 COP)</div>

              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> <strong>Todo lo del Plan Mensual +</strong></li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Prioridad de Horarios en la Grilla Semanal</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Acceso Completo al Taller de Series & Lecturas</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Diagnóstico Fonético Quincenal Personalizado</li>
                <li><span className={styles.checkIcon}><Check size={15} color="var(--accent-emerald)" /></span> Garantía de Avance de Nivel Certificado</li>
              </ul>
            </div>

            <Link href="/register/student?plan=trimestral" className={styles.btnPrimary} style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span>Aprovechar Plan Trimestral</span>
              <Sparkles size={16} />
            </Link>
          </div>
        </div>

        <div className={styles.promoCallout} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
          <div style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }}>
            <Gift size={20} />
          </div>
          <div>
            <strong>¿Buscas promociones especiales o un plan corporativo para tu equipo?</strong> <br />
            <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Pregunta por nuestras promociones activas del mes directamente en tu registro o{' '}
              <a 
                href="https://wa.me/573210000000?text=Hola,%20quisiera%20consultar%20promociones%20activas%20para%20LinguaLife" 
                target="_blank" 
                rel="noreferrer"
                style={{ color: 'var(--accent-emerald)', textDecoration: 'underline' }}
              >
                habla con un asesor por WhatsApp
              </a>.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
