import Link from 'next/link'
import styles from '@/styles/Landing.module.css'

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
              <div className={styles.planPrice}>$280.000 <span style={{ fontSize: '1rem', color: '#a1a1aa' }}>COP /mes</span></div>
              <div className={styles.planPeriod}>Facturación mensual cancelable en cualquier momento</div>

              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✓</span> Clases Privadas 1-a-1 en Vivo con Profesor</li>
                <li><span className={styles.checkIcon}>✓</span> Pocket Coach 24/7 en WhatsApp (Texto + Audios)</li>
                <li><span className={styles.checkIcon}>✓</span> Malla Curricular Unificada LDS de 60 Temas</li>
                <li><span className={styles.checkIcon}>✓</span> Sesgo de Vocabulario Personalizado a tu Carrera</li>
                <li><span className={styles.checkIcon}>✓</span> Tokens de Reposición para Clases Reagendadas</li>
              </ul>
            </div>

            <Link href="/register/student?plan=mensual" className={styles.btnSecondary} style={{ textAlign: 'center', display: 'block' }}>
              Inscribirme con Plan Mensual
            </Link>
          </div>

          {/* Plan Trimestral Destacado */}
          <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
            <span className={styles.badgePopular}>Más Popular • 15% Descuento</span>
            <div>
              <h3 className={styles.planTitle}>Plan Trimestral Intensivo</h3>
              <p className={styles.planDesc}>Aceleración máxima para alcanzar tu nivel B2 este trimestre.</p>
              <div className={styles.planPrice}>$238.000 <span style={{ fontSize: '1rem', color: '#a1a1aa' }}>COP /mes</span></div>
              <div className={styles.planPeriod}>Facturado cada 3 meses ($714.000 COP)</div>

              <ul className={styles.featureList}>
                <li><span className={styles.checkIcon}>✓</span> <strong>Todo lo del Plan Mensual +</strong></li>
                <li><span className={styles.checkIcon}>✓</span> Prioridad de Horarios en la Grilla Semanal</li>
                <li><span className={styles.checkIcon}>✓</span> Acceso Completo al Taller de Series & Lecturas</li>
                <li><span className={styles.checkIcon}>✓</span> Diagnóstico Fonético Quincenal Personalizado</li>
                <li><span className={styles.checkIcon}>✓</span> Garantía de Avance de Nivel Certificado</li>
              </ul>
            </div>

            <Link href="/register/student?plan=trimestral" className={styles.btnPrimary} style={{ textAlign: 'center', justifyContent: 'center' }}>
              Aprovechar Plan Trimestral ✨
            </Link>
          </div>
        </div>

        <div className={styles.promoCallout}>
          🎁 <strong>¿Buscas promociones especiales o un plan corporativo para tu equipo?</strong> <br />
          <span style={{ fontWeight: 400, color: '#a1a1aa', fontSize: '0.85rem' }}>
            Pregunta por nuestras promociones activas del mes directamente en tu registro o{' '}
            <a 
              href="https://wa.me/573210000000?text=Hola,%20quisiera%20consultar%20promociones%20activas%20para%20LinguaLife" 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#34d399', textDecoration: 'underline' }}
            >
              habla con un asesor por WhatsApp
            </a>.
          </span>
        </div>
      </div>
    </section>
  )
}
