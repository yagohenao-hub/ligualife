import React, { useState, useEffect, useCallback, useRef } from 'react'
import Head from 'next/head'

interface ChecklistItem {
  id: string
  title: string
  detail?: string
}

interface ChecklistSubgroup {
  title?: string
  items: ChecklistItem[]
}

interface ChecklistBlock {
  id: string
  icon: string
  accentBg: string
  accentColor: string
  borderColor?: string
  title: string
  subtitle: string
  subgroups: ChecklistSubgroup[]
}

const CHECKLIST_BLOCKS: ChecklistBlock[] = [
  {
    id: 'b1',
    icon: '🗄️',
    accentBg: 'rgba(6, 182, 212, 0.14)',
    accentColor: '#22d3ee',
    title: 'Bloque 1 — Base de Datos & Auditoría del Currículo',
    subtitle: 'Supabase limpio, 60 temas auditados, diapositivas y vocabulario polisémico listos',
    subgroups: [
      {
        title: '1.1 Limpieza y Salud de Supabase (PostgreSQL)',
        items: [
          {
            id: 'b1-1',
            title: 'Auditar todas las tablas activas en Supabase contra los esquemas SQL.',
            detail: 'Verificar students, teachers, sessions, curriculum_topics, topic_mastery, vocabulary_*, holidays y teacher_ratings.'
          },
          {
            id: 'b1-2',
            title: 'Depurar datos de prueba/basura y dejar solo 1 cuenta oficial DEMO_STUDENT + DEMO_TEACHER.',
            detail: 'Eliminar sesiones huérfanas, alumnos ficticios y saldos de tokens inconsistentes.'
          },
          {
            id: 'b1-3',
            title: 'Validar unicidad de PINs de acceso en la tabla students.'
          },
          {
            id: 'b1-4',
            title: 'Inventariar dependencias residuales de Airtable en lib/database.ts.',
            detail: 'Dejar lista exacta de qué sigue tocando Airtable para removerlo 100% en la semana del 15 Dic.'
          },
          {
            id: 'b1-5',
            title: 'Activar backups diarios en Supabase y exportar un dump SQL manual de respaldo.'
          }
        ]
      },
      {
        title: '1.2 Revisión de los 60 Temas del Currículo',
        items: [
          {
            id: 'b1-6',
            title: 'Auditar Temas 1 al 20 (Prioridad Diciembre) en curriculum-summary.ts y Supabase.',
            detail: 'Títulos limpios sin siglas internas, 3–4 ejemplos reales EN/ES, fórmula clara y commonMistake (wrong vs. correct).'
          },
          {
            id: 'b1-7',
            title: 'Auditar Temas 21 al 60 (B1 a C2) eliminando placeholders genéricos.'
          },
          {
            id: 'b1-8',
            title: 'Revisar diapositivas cacheadas (cached_slides) de los primeros 15 temas.',
            detail: 'Confirmar que no haya HTML roto, tablas desbordadas ni errores ortográficos.'
          },
          {
            id: 'b1-9',
            title: 'Validar banco de Short Readings (short-reading-seed.ts) y fallback para los 60 temas.'
          }
        ]
      },
      {
        title: '1.3 Revisión del Banco de Vocabulario Polisémico',
        items: [
          {
            id: 'b1-10',
            title: 'Auditar las 4 categorías y niveles A1–C2 en lib/vocabulary.ts.',
            detail: 'Verificar IPA, doble acepción polisémica, ejemplos EN/ES y lecturas adaptadas por nivel.'
          },
          {
            id: 'b1-11',
            title: 'Probar persistencia de estado de palabras (to_learn → passive → mastered) en /api/student/vocabulary.'
          }
        ]
      }
    ]
  },
  {
    id: 'b2',
    icon: '⚙️',
    accentBg: 'rgba(139, 92, 246, 0.14)',
    accentColor: '#c4b5fd',
    title: 'Bloque 2 — Revisión Técnica End-to-End de Cada Módulo (QA)',
    subtitle: 'Pruebas completas como usuario real en Alumno, Profesor, Admin y WhatsApp Pocket Coach',
    subgroups: [
      {
        title: '2.1 Landing Page, Login & Páginas Legales',
        items: [
          {
            id: 'b2-1',
            title: 'Auditar Landing Page (/): precios de diciembre, propuesta clara y botón directo a WhatsApp.'
          },
          {
            id: 'b2-2',
            title: 'Probar /login para los 3 roles (Alumno PIN, Profesor, Admin) y mensajes de error claros.'
          }
        ]
      },
      {
        title: '2.2 Portal del Alumno (/student y /student/vocabulary)',
        items: [
          {
            id: 'b2-3',
            title: 'Probar Próximas Clases & Reagendamiento: vista de 1 clase, botón "Ver todas", cancelar >24h (+1 Token) y bloqueo <24h.'
          },
          {
            id: 'b2-4',
            title: 'Probar Canje de Tokens: disponibilidad real del profe → agendar slot → descuenta 1 token sin duplicar sesiones.'
          },
          {
            id: 'b2-5',
            title: 'Stress-Test de los 4 Botones Core (Temas + Vocabulario).',
            detail: '1) Resumen legible en móvil · 2) Repaso (15) sin soluciones filtradas tras [___] · 3) Trivia Infinita por 25+ preguntas seguidas sin congelarse + rangos guardados en Supabase · 4) Short Reading con audio 0.5x/0.75x/1.0x.'
          },
          {
            id: 'b2-6',
            title: 'Verificar Deep-Links desde el dashboard (?mode=resumen|repaso|trivia|reading) hacia /student/vocabulary.'
          }
        ]
      },
      {
        title: '2.3 Portal del Profesor (/dashboard, /classroom) & Panel Admin (/admin)',
        items: [
          {
            id: 'b2-7',
            title: 'Simular una clase completa en /classroom: notas previas → slides → guardar notas → Finalizar Clase.',
            detail: 'Confirmar que el tema aparece de inmediato como "Completado" con sus 4 botones en el portal del alumno.'
          },
          {
            id: 'b2-8',
            title: 'Probar disponibilidad docente (/api/teacher/availability) y su reflejo inmediato en el calendario del alumno.'
          },
          {
            id: 'b2-9',
            title: 'Validar /admin: alta de alumno nuevo, generación de clases del mes, festivos y conteo exacto de clases por profesor.',
            detail: 'Crítico para liquidar sin errores los $300.000 COP / mes por alumno a cada profesor.'
          }
        ]
      },
      {
        title: '2.4 WhatsApp Pocket Coach (Evolution API + Railway + Gemini)',
        items: [
          {
            id: 'b2-10',
            title: 'Montar SIM corporativa en celular dedicado 24/7 (cargador fijo, Wi-Fi estable, sin ahorro de batería).'
          },
          {
            id: 'b2-11',
            title: 'Prueba de estabilidad 48h de Pocket Coach: cron 8:00 AM, respuesta por texto, respuesta por nota de voz y alerta si se desconecta.'
          }
        ]
      }
    ]
  },
  {
    id: 'b3',
    icon: '🛡️',
    accentBg: 'rgba(16, 185, 129, 0.14)',
    accentColor: '#34d399',
    title: 'Bloque 3 — Puntos Ciegos Críticos de Producción',
    subtitle: 'Elementos clave que suelen romper un MVP en vivo si no se validan antes de lanzar',
    subgroups: [
      {
        items: [
          {
            id: 'b3-1',
            title: 'Pruebas en celulares reales (iPhone Safari + Android Chrome): audio TTS, sonidos de Trivia y teclado virtual en Repaso.',
            detail: 'iOS bloquea audio si Web Audio no se desbloquea en el primer toque del usuario.'
          },
          {
            id: 'b3-2',
            title: 'Prueba de Zonas Horarias (Timezones): simular alumno fuera de Colombia (USA / España / México) vs. profesor UTC-5.'
          },
          {
            id: 'b3-3',
            title: 'Alertas de presupuesto en Google Cloud (Gemini API) a $10, $25 y $50 USD + verificar que ninguna API key use NEXT_PUBLIC_.'
          },
          {
            id: 'b3-4',
            title: 'Configurar UptimeRobot / BetterStack (gratis) monitoreando /api/health y Evolution API en Railway.'
          },
          {
            id: 'b3-5',
            title: 'Crear Kit de Onboarding "Día 0" para alumno nuevo: mensaje plantilla con PIN + link Meet + video de 60s explicando los 4 botones y tokens.'
          },
          {
            id: 'b3-6',
            title: 'Eliminar esta ruta temporal (/checklist y /api/checklist) antes del lanzamiento público definitivo.'
          }
        ]
      }
    ]
  },
  {
    id: 'b4',
    icon: '👨‍💻',
    accentBg: 'rgba(244, 63, 94, 0.14)',
    accentColor: '#fda4af',
    borderColor: 'rgba(244, 63, 94, 0.35)',
    title: 'Bloque 4 — Semana del 15 de Diciembre (Apoyo Técnico → v1.0)',
    subtitle: 'Aprovechar al máximo la visita técnica en seguridad, arquitectura, caché IA y pagos automáticos',
    subgroups: [
      {
        title: '4.1 Preparación Previa Obligatoria (Antes del 14 de diciembre)',
        items: [
          {
            id: 'b4-1',
            title: 'Accesos listos para trabajar en la semana técnica: GitHub, Vercel, Supabase, Railway y Google Cloud.'
          },
          {
            id: 'b4-2',
            title: 'Lista priorizada de bugs reales (P0–P2) reportados por los primeros alumnos de diciembre + ARQUITECTURA_CORE_4_BOTONES_Y_TRIVIA.md a mano.'
          }
        ]
      },
      {
        title: '4.2 Plan Quirúrgico Día a Día (15 al 19 de Diciembre)',
        items: [
          {
            id: 'b4-3',
            title: 'Lun 15 — Seguridad, Auth & RLS: sesiones firmadas (JWT/cookie) en /api/admin/* y /api/student/*, RLS en Supabase y limpieza legacy Airtable.'
          },
          {
            id: 'b4-4',
            title: 'Mar 16 — Blindaje DB & Transacciones: migraciones SQL versionadas, índices y locks transaccionales para evitar doble reserva o saldo de tokens roto.'
          },
          {
            id: 'b4-5',
            title: 'Mié 17 — Caché Compartido IA & Pocket Coach: guardar preguntas IA en tabla Supabase (baja >80% costo Gemini), Rate Limiting y cola de reintentos Evolution API.'
          },
          {
            id: 'b4-6',
            title: 'Jue 18 — Webhooks de Pago & Observabilidad: integración Wompi/Stripe → activación automática de plan en Supabase + instalar Sentry.'
          },
          {
            id: 'b4-7',
            title: 'Vie 19 — QA Final, CI/CD & Release v1.0.0: ramas main/develop, pruebas E2E completas y guía de emergencias.'
          }
        ]
      }
    ]
  },
  {
    id: 'b5',
    icon: '💰',
    accentBg: 'rgba(245, 158, 11, 0.14)',
    accentColor: '#fcd34d',
    title: 'Bloque 5 — Campaña de Marketing Diciembre, Ventas & Legal (Caja)',
    subtitle: 'Meta inmediata: 20 alumnos pagos ($9.0M COP facturados · $2.2M COP libres/mes)',
    subgroups: [
      {
        title: '5.1 Oferta, Assets Comerciales & Reenganche',
        items: [
          {
            id: 'b5-1',
            title: 'Congelar precios de diciembre: Regular ($450k), Intensivo Receso ($790k), Fast-Track ($1.15M) + oferta de referidos para alumnos antiguos.'
          },
          {
            id: 'b5-2',
            title: 'Finalizar 3 assets de cierre WhatsApp: Infografía PDF 1 pág., carrusel de 4–5 pantallas reales y 2–3 testimonios cortos.'
          },
          {
            id: 'b5-3',
            title: 'Contactar base de alumnos antiguos con oferta de relanzamiento (objetivo: primeros 5 cierres rápidos).'
          }
        ]
      },
      {
        title: '5.2 Pauta Meta Ads & Contenido Orgánico',
        items: [
          {
            id: 'b5-4',
            title: 'Configurar Meta Business Manager, cuenta publicitaria y método de pago ($5 USD/día = ~$500k COP/mes).'
          },
          {
            id: 'b5-5',
            title: 'Grabar y editar 3–4 videos cortos (30–45s) para los 3 Buying Personas (Tech/Remoto, Receso Diciembre, Demo Pocket Coach).'
          },
          {
            id: 'b5-6',
            title: 'Encender campaña Meta Ads directo a WhatsApp (a más tardar primera semana de diciembre) + 3 Reels orgánicos/semana.'
          }
        ]
      },
      {
        title: '5.3 Embudo de Ventas WhatsApp, Pagos & Legal Lean',
        items: [
          {
            id: 'b5-7',
            title: 'Guion de cierre consultivo por WhatsApp (cero Zoom gratis): 3 preguntas filtro + Hoja de Ruta + nota de voz 45s + seguimiento D+1/D+3/D+7.'
          },
          {
            id: 'b5-8',
            title: 'Montar CRM ligero (Notion/Sheets) para trackear cada lead, costo por chat (meta < $2.000 COP) y tasa de cierre (meta 7–8%).'
          },
          {
            id: 'b5-9',
            title: 'Activar links de pago Wompi / PSE / Stripe y hoja de caja separando $300k profe / $25k pauta / $15k soft / $110k libres por alumno.'
          },
          {
            id: 'b5-10',
            title: 'Publicar textos legales definitivos en /terms y /privacy (Habeas Data WhatsApp, política 24h tokens y no reembolso).'
          },
          {
            id: 'b5-11',
            title: 'Alineación escrita entre socios: dedicación semanal, metas dic–feb y reglas de participación (incluyendo futura rama editorial).'
          }
        ]
      }
    ]
  }
]

const SENIOR_DAYS = [
  { day: 'LUN 15 DIC', title: 'Seguridad & Auth', items: ['JWT / Cookies API', 'Supabase RLS', 'Adiós Airtable legacy'] },
  { day: 'MAR 16 DIC', title: 'DB & Tokens', items: ['Migraciones SQL', 'Locks anti-duplicados', 'Índices de consulta'] },
  { day: 'MIÉ 17 DIC', title: 'IA & WhatsApp', items: ['Caché IA en Supabase', 'Rate Limiting API', 'Cola Pocket Coach'] },
  { day: 'JUE 18 DIC', title: 'Pagos & Sentry', items: ['Webhook Wompi/Stripe', 'Alta automática', 'Alertas Sentry'] },
  { day: 'VIE 19 DIC', title: 'Release v1.0.0', items: ['QA End-to-End', 'Ramas main/dev', 'Despliegue oficial'] }
]

const ROADMAP_WEEKS = [
  {
    week: 'Sem. 1',
    dates: '19 – 24 Nov',
    color: '#38bdf8',
    tech: 'Limpieza Supabase + Temas 1–20 + Celular dedicado Pocket Coach',
    biz: 'Alineación socios + Congelar oferta + Grabar 3 videos + Activar Wompi',
    deliverable: 'DB limpia, Pocket Coach 24/7 y creativos listos'
  },
  {
    week: 'Sem. 2',
    dates: '25 Nov – 1 Dic',
    color: '#fbbf24',
    tech: 'QA móvil (iOS/Android) de 4 botones, Tokens, /dashboard, /admin y legales',
    biz: 'Reenganche antiguos + Encender Meta Ads ($5/día) + CRM WhatsApp',
    deliverable: 'Primeros 5 alumnos cerrados + Pauta corriendo'
  },
  {
    week: 'Sem. 3',
    dates: '2 – 13 Dic',
    color: '#c4b5fd',
    tech: 'Auditoría temas 21–60 + Backlog priorizado de bugs reales + Accesos listos',
    biz: 'Optimizar anuncios + Seguimiento receso diciembre + Onboarding Día 0',
    deliverable: '12–15 alumnos activos + Backlog listo para el 15 Dic'
  },
  {
    week: 'Sem. 4 🔥',
    dates: '15 – 20 Dic',
    color: '#fda4af',
    highlight: true,
    tech: 'SPRINT v1.0 (Apoyo Senior): Auth/RLS, Caché IA Supabase, Webhooks Pago, Sentry, v1.0.0',
    biz: 'Cierre meta 20 alumnos pagos + Primer corte financiero ($2.2M libres)',
    deliverable: 'LinguaLife v1.0 en producción + Caja validada'
  }
]

const LOCAL_STORAGE_KEY = 'll_sprint_checklist_live_v1'

export default function LaunchChecklistPage() {
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [blockFilter, setBlockFilter] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'TODO' | 'DONE'>('ALL')
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({})
  const [isCloudSynced, setIsCloudSynced] = useState<boolean | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(prev => (prev === msg ? null : prev)), 2600)
  }, [])

  const fetchCloudState = useCallback(async () => {
    try {
      const res = await fetch('/api/checklist')
      const data = await res.json()
      if (data.ok && data.synced) {
        setIsCloudSynced(true)
        setChecked(data.checked || {})
        setNotes(data.notes || {})
        try {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify({ checked: data.checked || {}, notes: data.notes || {} })
          )
        } catch {}
      } else {
        setIsCloudSynced(false)
      }
    } catch {
      setIsCloudSynced(false)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.checked) setChecked(parsed.checked)
        if (parsed.notes) setNotes(parsed.notes)
      }
    } catch {}

    fetchCloudState()
    const interval = setInterval(fetchCloudState, 15000)
    return () => clearInterval(interval)
  }, [fetchCloudState])

  const persistState = useCallback(
    (nextChecked: Record<string, boolean>, nextNotes: Record<string, string>) => {
      try {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({ checked: nextChecked, notes: nextNotes })
        )
      } catch {}

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: nextChecked, notes: nextNotes })
          })
          const data = await res.json()
          setIsCloudSynced(Boolean(data.ok && data.synced))
        } catch {
          setIsCloudSynced(false)
        }
      }, 250)
    },
    []
  )

  const toggleItem = (id: string) => {
    const nextChecked = { ...checked, [id]: !checked[id] }
    setChecked(nextChecked)
    persistState(nextChecked, notes)
  }

  const saveNote = (id: string) => {
    const nextNotes = { ...notes, [id]: noteDraft.trim() }
    if (!noteDraft.trim()) delete nextNotes[id]
    setNotes(nextNotes)
    setEditingNoteId(null)
    setNoteDraft('')
    persistState(checked, nextNotes)
    showToast('📝 Nota guardada')
  }

  const handleReset = () => {
    if (!confirm('¿Reiniciar todas las casillas marcadas?')) return
    setChecked({})
    persistState({}, notes)
    showToast('↺ Progreso reiniciado')
  }

  const handleCopyNotion = () => {
    const lines: string[] = ['# ✅ Checklist Sprint Lanzamiento MVP & v1.0 (LinguaLife)', '']
    CHECKLIST_BLOCKS.forEach(block => {
      lines.push(`## ${block.title}`)
      block.subgroups.forEach(sg => {
        if (sg.title) lines.push(`### ${sg.title}`)
        sg.items.forEach(item => {
          const mark = checked[item.id] ? 'x' : ' '
          const noteSuffix = notes[item.id] ? ` _(Nota: ${notes[item.id]})_` : ''
          lines.push(`- [${mark}] ${item.title}${noteSuffix}`)
        })
      })
      lines.push('')
    })

    navigator.clipboard
      .writeText(lines.join('\n'))
      .then(() => showToast('✅ Markdown copiado — pégalo directo en Notion'))
      .catch(() => showToast('⚠️ No se pudo copiar automáticamente'))
  }

  const allItems = CHECKLIST_BLOCKS.flatMap(b => b.subgroups.flatMap(sg => sg.items))
  const totalCount = allItems.length
  const doneCount = allItems.filter(i => checked[i.id]).length
  const globalPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0

  const allCollapsed = CHECKLIST_BLOCKS.every(b => collapsedBlocks[b.id])
  const toggleAllBlocks = () => {
    const next: Record<string, boolean> = {}
    CHECKLIST_BLOCKS.forEach(b => {
      next[b.id] = !allCollapsed
    })
    setCollapsedBlocks(next)
  }

  return (
    <>
      <Head>
        <title>LinguaLife — Checklist Sprint MVP & v1.0</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="ll-checklist-root">
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <div className="logo">L</div>
              <div>
                <h1>LinguaLife — Checklist Sprint MVP &amp; v1.0</h1>
                <span>19 Nov → 20 Dic 2026 · Ruta temporal (/checklist)</span>
              </div>
            </div>

            <div className="topbar-actions">
              <span
                className="sync-pill"
                title={
                  isCloudSynced
                    ? 'Sincronizado en vivo con Supabase entre dispositivos'
                    : 'Guardado localmente en este navegador'
                }
              >
                {isCloudSynced === null
                  ? '⏳ Conectando...'
                  : isCloudSynced
                  ? '🟢 Sync en vivo (Nube)'
                  : '🟡 Guardado local'}
              </span>
              <button type="button" className="btn" onClick={toggleAllBlocks}>
                {allCollapsed ? '↓ Expandir todo' : '↑ Plegar todo'}
              </button>
              <button type="button" className="btn" onClick={handleReset}>
                ↺ Reiniciar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleCopyNotion}>
                📋 Copiar para Notion
              </button>
            </div>
          </div>
        </header>

        <main className="wrap">
          <section className="hero">
            <span className="eyebrow">🚀 Plan Maestro de Lanzamiento · Ejecución en Paralelo</span>
            <h2>Checklist Completa para Sacar el MVP al Mercado y Cerrar v1.0</h2>
            <p>
              Desglose granular de todo lo que debe quedar verificado —desde Supabase y los 60 temas
              del currículo hasta la campaña de diciembre y la semana de consolidación v1.0—.
            </p>

            <div className="milestones-grid">
              <div className="milestone-card" style={{ borderColor: 'rgba(245, 158, 11, 0.35)' }}>
                <span className="label" style={{ color: '#fbbf24' }}>
                  💰 Hito Comercial (Diciembre)
                </span>
                <span className="val">20 Alumnos Pagos</span>
                <span className="sub">
                  ~$9.0M COP facturados · ~$2.2M COP libres/mes ($5 USD/día Meta Ads)
                </span>
              </div>
              <div className="milestone-card" style={{ borderColor: 'rgba(244, 63, 94, 0.35)' }}>
                <span className="label" style={{ color: '#fda4af' }}>
                  👨‍💻 Hito Técnico Crítico
                </span>
                <span className="val">Semana del 15 Dic</span>
                <span className="sub">
                  Apoyo de Programador Senior → Seguridad, Caché IA, Webhooks &amp; Release v1.0
                </span>
              </div>
              <div className="milestone-card" style={{ borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                <span className="label" style={{ color: '#34d399' }}>
                  🎯 Core MVP en Producción
                </span>
                <span className="val">4 Botones + Clases 1-1</span>
                <span className="sub">
                  Resumen · Repaso (15) · Trivia Infinita · Short Reading + Pocket Coach 24/7
                </span>
              </div>
            </div>
          </section>

          <section className="progress-panel">
            <div className="progress-top">
              <span className="progress-title">Progreso Global del Sprint</span>
              <span className="progress-stat">
                {doneCount} / {totalCount} tareas ({globalPct}%)
              </span>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${globalPct}%` }} />
            </div>

            <div className="filters-bar">
              <div className="filter-group">
                <span className="filter-label">Bloque:</span>
                {[
                  { id: 'ALL', label: 'Todos' },
                  { id: 'b1', label: 'DB & Currículo' },
                  { id: 'b2', label: 'QA Técnico' },
                  { id: 'b3', label: 'Puntos Ciegos' },
                  { id: 'b4', label: 'Semana 15 Dic' },
                  { id: 'b5', label: 'Marketing & Caja' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    className={`filter-pill ${blockFilter === f.id ? 'active' : ''}`}
                    onClick={() => setBlockFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="filter-group">
                <span className="filter-label">Estado:</span>
                {(
                  [
                    { id: 'ALL', label: 'Todas' },
                    { id: 'TODO', label: 'Pendientes' },
                    { id: 'DONE', label: 'Completadas' }
                  ] as const
                ).map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`filter-pill ${statusFilter === s.id ? 'active' : ''}`}
                    onClick={() => setStatusFilter(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {CHECKLIST_BLOCKS.filter(b => blockFilter === 'ALL' || blockFilter === b.id).map(block => {
            const blockItems = block.subgroups.flatMap(sg => sg.items)
            const blockDone = blockItems.filter(i => checked[i.id]).length
            const isCollapsed = Boolean(collapsedBlocks[block.id])

            return (
              <section
                key={block.id}
                className="block-card"
                style={block.borderColor ? { borderColor: block.borderColor } : undefined}
              >
                <div
                  className="block-header"
                  onClick={() =>
                    setCollapsedBlocks(prev => ({ ...prev, [block.id]: !prev[block.id] }))
                  }
                >
                  <div className="block-header-left">
                    <div
                      className="block-icon"
                      style={{ background: block.accentBg, color: block.accentColor }}
                    >
                      {block.icon}
                    </div>
                    <div className="block-title">
                      <h3>{block.title}</h3>
                      <p>{block.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className="block-progress-badge"
                    style={{
                      color:
                        blockDone === blockItems.length && blockItems.length > 0
                          ? '#34d399'
                          : '#cbd5e1'
                    }}
                  >
                    {blockDone} / {blockItems.length}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="block-body">
                    {block.subgroups.map((sg, sgIdx) => {
                      const visibleItems = sg.items.filter(item => {
                        const isDone = Boolean(checked[item.id])
                        if (statusFilter === 'DONE') return isDone
                        if (statusFilter === 'TODO') return !isDone
                        return true
                      })

                      if (visibleItems.length === 0) return null

                      return (
                        <div key={sgIdx}>
                          {sg.title && <div className="subgroup-title">{sg.title}</div>}
                          <div className="task-list">
                            {visibleItems.map(item => {
                              const isDone = Boolean(checked[item.id])
                              const existingNote = notes[item.id]
                              const isEditing = editingNoteId === item.id

                              return (
                                <div key={item.id} className={`task-item ${isDone ? 'done' : ''}`}>
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => toggleItem(item.id)}
                                  />
                                  <div className="task-content">
                                    <div
                                      className="task-text"
                                      onClick={() => toggleItem(item.id)}
                                    >
                                      <strong>{item.title}</strong>
                                    </div>
                                    {item.detail && <div className="task-sub">{item.detail}</div>}
                                    {existingNote && !isEditing && (
                                      <div className="note-box">📝 {existingNote}</div>
                                    )}
                                    {isEditing && (
                                      <div className="note-editor">
                                        <input
                                          type="text"
                                          value={noteDraft}
                                          onChange={e => setNoteDraft(e.target.value)}
                                          placeholder="Escribe una nota rápida..."
                                          onKeyDown={e => {
                                            if (e.key === 'Enter') saveNote(item.id)
                                            if (e.key === 'Escape') setEditingNoteId(null)
                                          }}
                                          autoFocus
                                        />
                                        <button
                                          type="button"
                                          className="mini-btn save"
                                          onClick={() => saveNote(item.id)}
                                        >
                                          Guardar
                                        </button>
                                        <button
                                          type="button"
                                          className="mini-btn"
                                          onClick={() => setEditingNoteId(null)}
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    className="note-trigger"
                                    title="Agregar o editar nota"
                                    onClick={() => {
                                      setEditingNoteId(item.id)
                                      setNoteDraft(existingNote || '')
                                    }}
                                  >
                                    {existingNote ? '✏️' : '+ Nota'}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {block.id === 'b4' && (
                      <div className="senior-grid">
                        {SENIOR_DAYS.map(d => (
                          <div key={d.day} className="day-card">
                            <span className="day-pill">{d.day}</span>
                            <h4>{d.title}</h4>
                            <ul>
                              {d.items.map(it => (
                                <li key={it}>• {it}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )
          })}

          {/* Bloque 6: Cronograma Semanal */}
          <section className="block-card">
            <div className="block-header" style={{ cursor: 'default' }}>
              <div className="block-header-left">
                <div
                  className="block-icon"
                  style={{ background: 'rgba(56, 189, 248, 0.14)', color: '#38bdf8' }}
                >
                  🗓️
                </div>
                <div className="block-title">
                  <h3>Bloque 6 — Cronograma Semanal (19 Nov → 20 Dic)</h3>
                  <p>Sincronización en paralelo de Producto y Flujo de Caja hasta el lanzamiento v1.0</p>
                </div>
              </div>
            </div>
            <div className="table-scroll">
              <table className="roadmap-table">
                <thead>
                  <tr>
                    <th>Semana</th>
                    <th>Fechas</th>
                    <th>Foco Técnico / Producto</th>
                    <th>Foco Comercial / Negocio</th>
                    <th>Entregable Clave</th>
                  </tr>
                </thead>
                <tbody>
                  {ROADMAP_WEEKS.map(r => (
                    <tr
                      key={r.week}
                      style={r.highlight ? { background: 'rgba(244, 63, 94, 0.08)' } : undefined}
                    >
                      <td>
                        <strong style={{ color: r.highlight ? '#fda4af' : '#fff' }}>{r.week}</strong>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: r.color, whiteSpace: 'nowrap' }}>
                        {r.dates}
                      </td>
                      <td>{r.tech}</td>
                      <td>{r.biz}</td>
                      <td>
                        <strong style={{ color: r.highlight ? '#34d399' : '#f8fafc' }}>
                          {r.deliverable}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {toast && <div className="toast">{toast}</div>}
      </div>

      <style jsx>{`
        .ll-checklist-root {
          min-height: 100vh;
          background-color: #07090e;
          background-image:
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246, 0.14) 0%, transparent 40%),
            radial-gradient(circle at 90% 15%, rgba(6, 182, 212, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 50% 90%, rgba(16, 185, 129, 0.1) 0%, transparent 45%);
          background-attachment: fixed;
          color: #f8fafc;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          padding-bottom: 5rem;
        }
        .topbar {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(16px);
          background: rgba(7, 9, 14, 0.88);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.9rem 1.5rem;
        }
        .topbar-inner {
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .logo {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: linear-gradient(135deg, #8b5cf6, #06b6d4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #fff;
          font-size: 1.1rem;
        }
        .brand h1 {
          font-size: 1.02rem;
          font-weight: 800;
          margin: 0;
        }
        .brand span {
          font-size: 0.72rem;
          color: #94a3b8;
          display: block;
        }
        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .sync-pill {
          font-size: 0.74rem;
          font-weight: 700;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #e2e8f0;
        }
        .btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: #f8fafc;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .btn:hover {
          background: rgba(139, 92, 246, 0.18);
          border-color: #8b5cf6;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6d28d9, #8b5cf6);
          border: none;
          color: #fff;
        }
        .wrap {
          max-width: 1180px;
          margin: 0 auto;
          padding: 2rem 1.5rem 0;
        }
        .hero {
          margin-bottom: 1.5rem;
        }
        .eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #38bdf8;
          margin-bottom: 0.5rem;
        }
        .hero h2 {
          font-size: 2rem;
          font-weight: 900;
          line-height: 1.15;
          margin: 0 0 0.5rem 0;
          color: #fff;
        }
        .hero p {
          color: #94a3b8;
          font-size: 0.96rem;
          max-width: 820px;
          margin: 0;
        }
        .milestones-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin: 1.4rem 0;
        }
        .milestone-card {
          background: rgba(15, 19, 30, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .milestone-card .label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
        }
        .milestone-card .val {
          font-size: 1.25rem;
          font-weight: 900;
          color: #fff;
        }
        .milestone-card .sub {
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .progress-panel {
          background: rgba(15, 19, 30, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          padding: 1.25rem 1.4rem;
          margin-bottom: 1.5rem;
        }
        .progress-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.65rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .progress-title {
          font-weight: 800;
          font-size: 0.95rem;
        }
        .progress-stat {
          font-family: monospace;
          font-size: 0.9rem;
          font-weight: 700;
          color: #34d399;
        }
        .bar-track {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 999px;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981);
          border-radius: 999px;
          transition: width 0.35s ease;
        }
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .filter-label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
        }
        .filter-pill {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #cbd5e1;
          padding: 0.32rem 0.7rem;
          border-radius: 999px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
        }
        .filter-pill.active {
          background: #8b5cf6;
          border-color: #8b5cf6;
          color: #fff;
        }
        .block-card {
          background: rgba(15, 19, 30, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          margin-bottom: 1.4rem;
          overflow: hidden;
        }
        .block-header {
          padding: 1.15rem 1.4rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          cursor: pointer;
          user-select: none;
        }
        .block-header-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .block-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .block-title h3 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          margin: 0;
        }
        .block-title p {
          font-size: 0.8rem;
          color: #94a3b8;
          margin: 0.15rem 0 0 0;
        }
        .block-progress-badge {
          font-family: monospace;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          white-space: nowrap;
        }
        .block-body {
          padding: 1.15rem 1.4rem 1.4rem;
        }
        .subgroup-title {
          font-size: 0.78rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #94a3b8;
          margin: 1.15rem 0 0.65rem;
          padding-bottom: 0.35rem;
          border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
        }
        .task-list {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.8rem;
          padding: 0.75rem 0.9rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .task-item.done {
          opacity: 0.58;
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.22);
        }
        .task-item.done .task-text strong {
          text-decoration: line-through;
        }
        .task-item input[type='checkbox'] {
          width: 19px;
          height: 19px;
          accent-color: #10b981;
          cursor: pointer;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .task-content {
          flex: 1;
        }
        .task-text {
          font-size: 0.9rem;
          color: #f1f5f9;
          cursor: pointer;
        }
        .task-sub {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.2rem;
        }
        .note-box {
          margin-top: 0.4rem;
          font-size: 0.8rem;
          color: #fde68a;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
        }
        .note-editor {
          display: flex;
          gap: 0.4rem;
          margin-top: 0.45rem;
          flex-wrap: wrap;
        }
        .note-editor input {
          flex: 1;
          min-width: 180px;
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(139, 92, 246, 0.45);
          border-radius: 6px;
          padding: 0.35rem 0.6rem;
          color: #fff;
          font-size: 0.82rem;
        }
        .mini-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #e2e8f0;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
        }
        .mini-btn.save {
          background: #10b981;
          border-color: #10b981;
          color: #022c22;
        }
        .note-trigger {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          flex-shrink: 0;
        }
        .note-trigger:hover {
          color: #fff;
          border-color: #8b5cf6;
        }
        .senior-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
          margin-top: 1rem;
        }
        .day-card {
          background: rgba(244, 63, 94, 0.06);
          border: 1px solid rgba(244, 63, 94, 0.25);
          border-radius: 12px;
          padding: 0.9rem;
        }
        .day-pill {
          font-family: monospace;
          font-size: 0.72rem;
          font-weight: 800;
          color: #fda4af;
          display: block;
          margin-bottom: 0.3rem;
        }
        .day-card h4 {
          font-size: 0.86rem;
          color: #fff;
          margin: 0 0 0.4rem 0;
        }
        .day-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.77rem;
          color: #cbd5e1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .table-scroll {
          overflow-x: auto;
        }
        .roadmap-table {
          width: 100%;
          border-collapse: collapse;
        }
        .roadmap-table th {
          text-align: left;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #94a3b8;
          padding: 0.8rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .roadmap-table td {
          padding: 0.9rem 1rem;
          font-size: 0.85rem;
          color: #cbd5e1;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          vertical-align: top;
        }
        .toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          background: #10b981;
          color: #022c22;
          font-weight: 800;
          font-size: 0.85rem;
          padding: 0.7rem 1.1rem;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
          z-index: 200;
        }
        @media (max-width: 960px) {
          .milestones-grid,
          .senior-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
