import Head from 'next/head'
import Link from 'next/link'
import styles from '@/styles/Landing.module.css'

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard - LinguaLife</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Admin <span style={{ color: '#10b981' }}>Dashboard</span>
        </h1>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/admin.html" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '2rem', 
              background: 'rgba(16, 185, 129, 0.1)', 
              border: '1px solid #10b981', 
              borderRadius: '16px',
              width: '300px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>🛡️ Panel General & Matchmaker</h2>
              <p style={{ color: '#9ca3af' }}>Gestión de alumnos, profesores, vinculación de grupos y métricas.</p>
            </div>
          </a>

          <Link href="/admin/scene-studio" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '2rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '16px',
              width: '300px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>🖼️ Scene Studio</h2>
              <p style={{ color: '#9ca3af' }}>Creador y editor de escenas interactivas tipo Waldo para vocabulario visual.</p>
            </div>
          </Link>

          <Link href="/admin/story-studio" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '2rem', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '16px',
              width: '300px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <h2 style={{ color: 'white', marginBottom: '1rem' }}>📖 Story Studio</h2>
              <p style={{ color: '#9ca3af' }}>Creador de historias interactivas.</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
