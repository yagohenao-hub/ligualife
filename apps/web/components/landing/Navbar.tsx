import Link from 'next/link'
import styles from '@/styles/Landing.module.css'

interface NavbarProps {
  onOpenLogin: () => void
}

export function Navbar({ onOpenLogin }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <div className={styles.container} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" className={styles.logoArea}>
          <div className={styles.logoBadge}>LL</div>
          <span className={styles.logoText}>LinguaLife</span>
        </Link>

        <nav className={styles.navLinks}>
          <a href="#simulador" className={styles.navLink}>Probar Pocket Coach</a>
          <a href="#metodo" className={styles.navLink}>Método LDS</a>
          <a href="#precios" className={styles.navLink}>Planes & Tarifas</a>
        </nav>

        <div className={styles.navActions}>
          <button onClick={onOpenLogin} className={styles.btnSecondary}>
            Acceder con PIN
          </button>
          <Link href="/register/student" className={styles.btnPrimary}>
            Inscribirme Ahora ✨
          </Link>
        </div>
      </div>
    </header>
  )
}
