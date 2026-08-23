import { useState } from 'react'
import Head from 'next/head'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { PocketCoachSimulator } from '@/components/landing/PocketCoachSimulator'
import { MethodSection } from '@/components/landing/MethodSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { Footer } from '@/components/landing/Footer'
import { LoginModal } from '@/components/LoginModal'
import styles from '@/styles/Landing.module.css'

export default function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <>
      <Head>
        <title>LinguaLife — Sistema Acelerado de Fluidez B2 con Clases 1-a-1 & IA en WhatsApp</title>
        <meta 
          name="description" 
          content="Alcanza nivel B2 de inglés en 60 lecciones con clases privadas 1-a-1, copiloto inteligente para profesores y Pocket Coach disponible 24/7 en tu WhatsApp." 
        />
        <meta name="keywords" content="clases de inglés, inglés B2, clases privadas inglés, pocket coach whatsapp, método LDS" />
        <meta property="og:title" content="LinguaLife — Tu Camina Acelerado a la Fluidez B2" />
        <meta property="og:description" content="Aprende inglés real con clases 1-a-1 y práctica diaria 24/7 en tu WhatsApp." />
      </Head>

      <div className={styles.pageContainer}>
        <div className={styles.glowTop}></div>
        <div className={styles.glowMiddle}></div>

        <Navbar onOpenLogin={() => setIsLoginOpen(true)} />
        <HeroSection />
        <PocketCoachSimulator />
        <MethodSection />
        <PricingSection />
        <Footer />

        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
        />
      </div>
    </>
  )
}
