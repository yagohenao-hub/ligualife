import Link from 'next/link'
import styles from '@/styles/Landing.module.css'
import { LinguaLifeLogo } from '@/components/LinguaLifeLogo'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LinguaLifeLogo size="sm" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            — Sistema de Fluidez Acelerada B2
          </span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
          <Link href="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Términos & Condiciones</Link>
          <Link href="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Políticas de Privacidad</Link>
          <Link href="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Acceso por PIN</Link>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} LinguaLife Inc. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
