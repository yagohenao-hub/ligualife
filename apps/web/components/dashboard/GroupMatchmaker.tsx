import { useState, useEffect } from 'react'
import styles from '@/styles/Admin.module.css'

export default function GroupMatchmaker() {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    fetchCandidates()
  }, [])

  const fetchCandidates = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/matchmaker', {
        headers: { 'x-admin-token': 'LinguaAdmin2025' }
      })
      if (res.ok) {
        const data = await res.json()
        setCandidates(data.candidates || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Simplified matching logic for the MVP
  // Group students by their first Vertical and Age Range
  const grouped = candidates.reduce((acc, student) => {
    const key = `${student.ageRange || 'Adult'} - ${student.vertical || 'General'}`
    if (!acc[key]) acc[key] = []
    acc[key].push(student)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🤝</span> Matchmaker de Grupos
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Estos alumnos optaron por clases grupales. El sistema los ha agrupado por edad y vertical.
          Revisa sus disponibilidades para conformar un grupo.
        </p>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          No hay alumnos pendientes buscando clases grupales en este momento.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {(Object.entries(grouped) as [string, any[]][]).map(([key, groupMembers]) => (
            <div key={key} style={{ background: 'var(--surface-light)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                Afinidad: {key} <span style={{ fontSize: '0.8rem', background: '#374151', padding: '2px 8px', borderRadius: '100px', marginLeft: '8px' }}>{groupMembers.length} alumnos</span>
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {groupMembers.map((m: any) => (
                  <div key={m.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--accent-orange)' }}>{m.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{m.email}</div>
                    <div style={{ fontSize: '0.8rem' }}><strong>Metas:</strong> {m.needs}</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#10b981' }}>
                      <em>Disponibilidad: {m.hasAvailability ? 'Registrada' : 'Pendiente'}</em>
                    </div>
                  </div>
                ))}
              </div>

              {groupMembers.length >= 2 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>PROYECCIÓN MENSUAL</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#10b981' }}>
                      ${(400000 + (groupMembers.length - 1) * 60000).toLocaleString('es-CO')} COP
                    </div>
                  </div>
                  <button className={styles.btnPrimary} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    ⚡ Crear Grupo Sugerido
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
