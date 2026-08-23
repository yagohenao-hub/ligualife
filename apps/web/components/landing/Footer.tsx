import Link from 'next/link'
import styles from '@/styles/Landing.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className={styles.logoBadge} style={{ width: 28, height: 28, fontSize: '0.8rem' }}>LL</div>
          <span style={{ fontWeight: 700, color: '#f4f4f5' }}>LinguaLife 2.0</span>
          <span>— Sistema de Fluidez Acelerada B2</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
          <Link href="/terms" style={{ color: '#71717a', textDecoration: 'none' }}>Términos & Condiciones</Link>
          <Link href="/privacy" style={{ color: '#71717a', textDecoration: 'none' }}>Políticas de Privacidad</Link>
          <Link href="/login" style={{ color: '#71717a', textDecoration: 'none' }}>Acceso por PIN</Link>
        </div>

        <div>
          © {new Date().getFullYear()} LinguaLife Inc. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
