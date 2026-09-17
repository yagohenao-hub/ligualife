import Link from 'next/link'
import styles from '@/styles/Landing.module.css'
import { Zap, ArrowRight, Play, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

export function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroBadge} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={14} color="#F59E0B" />
          <span>Método Garantizado • Clases 1-a-1 + IA en WhatsApp</span>
        </div>

        <h1 className={styles.heroTitle}>
          Domina el Inglés Fluido <br />
          <span className={styles.gradientText}>Alcanza Nivel B2 Real en 60 Lecciones</span>
        </h1>

        <p className={styles.heroSubtitle}>
          Olvídate de apps pasivas o academias lentas. LinguaLife combina <strong>clases privadas en vivo con profesores expertos</strong> y tu propio <strong>Pocket Coach en WhatsApp disponible 24/7</strong> para corregirte y practicar todos los días.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/register/student" className={`${styles.btnPrimary} ${styles.btnHeroLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Comenzar mi Transformación a B2</span>
            <ArrowRight size={18} />
          </Link>
          <a href="#simulador" className={`${styles.btnSecondary} ${styles.btnHeroLarge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
            <Play size={16} fill="currentColor" />
            <span>Probar Pocket Coach en Vivo</span>
          </a>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <div className={styles.statVal}>60 Temas</div>
            <div className={styles.statLabel}>Malla Curricular Directa a B2</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal}>24/7</div>
            <div className={styles.statLabel}>Pocket Coach en WhatsApp</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statVal}>100%</div>
            <div className={styles.statLabel}>Personalizado a tus Metas</div>
          </div>
        </div>
      </div>
    </section>
  )
}
