import Link from 'next/link'
import styles from '@/styles/Landing.module.css'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LinguaLifeLogo } from '@/components/LinguaLifeLogo'
import { ArrowRight, User } from 'lucide-react'

interface NavbarProps {
  onOpenLogin: () => void
}

export function Navbar({ onOpenLogin }: NavbarProps) {
  return (
    <header className={styles.navbar}>
      <div className={styles.container} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <LinguaLifeLogo size="md" />
        </Link>

        <nav className={styles.navLinks}>
          <a href="#simulador" className={styles.navLink}>Probar Pocket Coach</a>
          <a href="#metodo" className={styles.navLink}>Método LDS</a>
          <a href="#precios" className={styles.navLink}>Planes & Tarifas</a>
        </nav>

        <div className={styles.navActions} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onOpenLogin} className={styles.btnSecondary} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <User size={15} />
            Acceder con PIN
          </button>
          <Link href="/register/student" className={styles.btnPrimary} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Inscribirme Ahora
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </header>
  )
}
