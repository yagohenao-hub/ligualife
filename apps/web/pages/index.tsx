import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { PixelMinerScene } from '@/components/PixelMinerScene'
import styles from '@/styles/WorkInProgress.module.css'

export default function HomeWorkInProgress() {
  return (
    <>
      <Head>
        <title>LinguaLife — Work In Progress ⛏️</title>
        <meta
          name="description"
          content="Estamos afinando los últimos detalles de nuestra plataforma. Accede a tu registro de estudiante o inicio de sesión directamente."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <div className={styles.ambientGlow}></div>

        <main className={styles.contentCard}>
          {/* Badge */}
          <div className={styles.pixelBadge}>
            <span>⛏️</span> WORK IN PROGRESS
          </div>

          {/* Title */}
          <h1 className={styles.title}>
            Estamos construyendo algo <span className={styles.titleGradient}>extraordinario</span>
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            Nuestra página principal está en preparación. Si vas a inscribirte o ya eres parte de LinguaLife, puedes ingresar directamente a continuación:
          </p>

          {/* Pixel Art Mining Animation Stage */}
          <div className={styles.pixelStage}>
            <div className={styles.sceneGrid}>
              <PixelMinerScene />
            </div>
            <div className={styles.pixelGround}></div>
          </div>

          {/* Progress Bar */}
          <div className={styles.progressWrapper}>
            <div className={styles.progressHeader}>
              <span>COMPILANDO PLATAFORMA</span>
              <span className={styles.progressHeaderVal}>88%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill}></div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className={styles.actionGroup}>
            <Link href="/register/student" className={styles.primaryBtn}>
              <span>🚀</span> Registrarme como Estudiante
            </Link>

            <div className={styles.secondaryGroup}>
              <Link href="/login" className={styles.secondaryBtn}>
                <span>🔐</span> Iniciar Sesión
              </Link>
              <Link href="/register/teacher" className={styles.secondaryBtn}>
                <span>👨‍🏫</span> Registro Profesores
              </Link>
            </div>

            <Link 
              href="/student/flashcards" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.4) 100%)',
                border: '1px solid rgba(196, 181, 253, 0.45)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                marginTop: '0.75rem',
                cursor: 'pointer'
              }}
            >
              <span>🃏</span> Explorar Flashcards Conceptuales (Beta) ↗
            </Link>
          </div>

          {/* Footer branding */}
          <div className={styles.footerNote}>
            LinguaLife &copy; {new Date().getFullYear()} — Sistema Acelerado de Fluidez B2
          </div>
        </main>
      </div>
    </>
  )
}
