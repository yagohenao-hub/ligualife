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
