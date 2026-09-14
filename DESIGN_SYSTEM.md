# 🏛️ LinguaLife Design System: Editorial Tech & High-Craft Studio
> **Versión:** 1.0.0 (Master Release)  
> **Propósito:** Guía de diseño canónica para eliminar la estética genérica de IA ("AI Slop") y establecer un estándar visual propietario, táctil, jerárquico y de vanguardia pedagógica para todo el ecosistema de LinguaLife.

---

## 1. 🧬 Filosofía & Manifiesto Visual (Anti-AI-Slop)

El diseño generado por IA promedio suele caer en el "promedio estadístico" de las plantillas web: fondos negros planos con gradientes cian/violeta saturados, glassmorphism genérico con bordes uniformes de 0.1 de opacidad, rejillas simétricas de 3 columnas y fuentes genéricas sin calibrar.

**LinguaLife rompe este patrón con 5 pilares fundamentales:**

1. **Iluminación Táctil en vez de Glassmorphism Plano:**  
   Cada superficie cuenta con un gradiente de luminancia vertical sutil y un **bisel de luz interior superior (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.08)`)** que simula volumen físico y profundidad artesanal.
2. **Jerarquía Tipográfica Triple con Intención:**  
   - `Plus Jakarta Sans`: Títulos, jerarquía editorial y marca. Aporta carácter geométrico contemporáneo.  
   - `Inter`: Cuerpo de texto, explicaciones y legibilidad de lectura prolongada.  
   - `JetBrains Mono`: Fórmulas gramaticales (LDS), identificadores de clase, tiempos verbales y métricas de precisión técnica.
3. **Atmósfera Obsidiana & Ámbar Dorado (Studio Craft):**  
   Reemplazamos el violeta/azul genérico de SaaS por una paleta insignia de **Ámbar Dorado (`#F59E0B` / `#D97706`)** sobre fondos **Obsidiana Profundo (`#08090C`, `#0F1118`, `#161922`)**, evocando maestría, calidez académica y lujo accesible.
4. **Composiciones Asimétricas Tipo Bento:**  
   Evitamos las cuadrículas de tarjetas idénticas. Las interfaces guían la atención del estudiante combinando tarjetas principales a ancho completo con módulos secundarios de interacción rápida.
5. **Física de Movimiento con Inercia Orgánica:**  
   Todas las transiciones emplean curvas cúbicas de estudio (`cubic-bezier(0.16, 1, 0.3, 1)`) con micro-depresión física al hacer clic (`:active { transform: scale(0.98); }`).

---

## 2. 🎨 Paleta de Color & Tokens Semánticos

### 2.1. Superficies & Fondos (Obsidian Layers)
```css
--bg-obsidian: #08090c;       /* Fondo raíz global */
--surface-0: #0d0f15;          /* Contenedores base */
--surface-1: #13161f;          /* Tarjetas principales y paneles */
--surface-2: #1a1e2b;          /* Tarjetas elevadas, modales y wells */
--surface-3: #24293a;          /* Estados hover y elementos interactivos */
--surface-glass: rgba(19, 22, 31, 0.75); /* Vidrio esmerilado con tinte obsidiana */
```

### 2.2. Acentos Principales & Resplandor
```css
--accent-amber: #f59e0b;       /* Acento primario insignia LinguaLife */
--accent-amber-hover: #d97706; /* Hover primario */
--accent-amber-glow: rgba(245, 158, 11, 0.22); /* Halo de enfoque */

--accent-indigo: #6366f1;      /* Acento secundario tecnológico / interactivo */
--accent-indigo-glow: rgba(99, 102, 241, 0.2);
```

### 2.3. Estados Semánticos
```css
--status-success: #10b981;     /* Éxito, clases completadas, asistencia */
--status-warning: #fbbf24;     /* Cooldowns, recordatorios, festivos */
--status-danger: #f43f5e;      /* Errores, alertas, cancelaciones */
--status-info: #38bdf8;        /* Tips, información contextual */
```

### 2.4. Bordes & Biseles de Luz
```css
--border-subtle: rgba(255, 255, 255, 0.07);    /* Borde perimetral estándar */
--border-highlight: rgba(255, 255, 255, 0.14); /* Borde enfocado / hover */
--border-amber: rgba(245, 158, 11, 0.4);       /* Borde activo destacado */

--bevel-top: inset 0 1px 0 rgba(255, 255, 255, 0.09); /* Bisel táctil de luz superior */
--shadow-elevation: 0 8px 32px -4px rgba(0, 0, 0, 0.6), var(--bevel-top);
```

---

## 3. ✍️ Sistema Tipográfico

| Rol | Familia Tipográfica | Pesos | Tracking | Uso Exclusivo |
| :--- | :--- | :--- | :--- | :--- |
| **Brand & Headings** | `Plus Jakarta Sans` | `600`, `700`, `800` | `-0.02em` | H1, H2, H3, nombres de lecciones, títulos de secciones. |
| **Body & Narrative** | `Inter` | `400`, `500`, `600` | `0` | Párrafos, explicaciones pedagógicas, notas, tooltips. |
| **Technical & Logic** | `JetBrains Mono` | `500`, `700` | `-0.01em` | Fórmulas LDS (S+T+A), números de clase `#01`, chips de tiempo, PINs. |

### Clases Utilitarias
- `.font-heading`: Aplica `var(--font-heading)` con antialiasing optimizado.
- `.font-mono`: Aplica `var(--font-mono)` para fórmulas sintácticas.
- `.font-body`: Aplica `var(--font-body)` con espaciado de línea `1.6`.

---

## 4. 🎴 Arquitectura de Componentes

### 4.1. Tarjeta de Progreso Integral (Mastery Progress Card)
- **Fondo:** `linear-gradient(180deg, rgba(26, 30, 43, 0.8) 0%, rgba(13, 15, 21, 0.95) 100%)`.
- **Borde:** `1px solid var(--border-subtle)` + `var(--bevel-top)`.
- **Barra de Avance:** Doble capa: riel oscuro con gradiente de llenado `linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)` y sombra de resplandor ambiental.

### 4.2. Escala de Maestría de 6 Niveles (Mastery Materials)
Cada lección completada sube de rango en una escala de materiales nobles:
1. 🪵 **Madera (Tier 1):** Borde nogal cálido `#78350f` con insignia rústica.
2. 🪨 **Hierro (Tier 2):** Gris pizarra acero `#475569` con destello metálico frío.
3. 🥉 **Bronce (Tier 3):** Cobre bruñido `#b45309` con reflejo cálido.
4. 🥈 **Plata (Tier 4):** Cromo pulido `#94a3b8` con bisel plateado brillante.
5. 🥇 **Oro (Tier 5):** Ámbar dorado real `#f59e0b` con destello solar.
6. 💎 **Platino (Tier 6):** Gradiente prismático cian-violeta con animación de resplandor `gem-shine`.

### 4.3. Chips de Temas (Topic Chips)
- Formato estructurado: `[Icono de Rango] [Número en JetBrains Mono] [Nombre de la Lección en Plus Jakarta Sans] [📖]`.
- Al hacer clic: Abre el modal de diapositivas y **actualiza automáticamente el rango de maestría** si se ha cumplido el cooldown de 12 horas.

### 4.4. Botones Táctiles (Tactile Buttons)
```css
.btn-primary {
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  color: #000;
  font-family: var(--font-heading);
  font-weight: 700;
  border-radius: 10px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 4px 16px var(--accent-amber-glow);
  transition: all 0.25s var(--ease-spring);
}
.btn-primary:active {
  transform: scale(0.975);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}
```

### 4.5. Bento Cards & Módulos "Próximamente"
- Ocupan el 100% del ancho del contenedor.
- Cuentan con un efecto `shimmer` suave continuo en el fondo y badge con punto pulsante activo (`pulseDot`).
- Elevación de 2px en hover con sutil cambio de borde a violeta/ámbar.

---

## 5. ⚡ Física de Movimiento & Animaciones

- **Curva Elástica Canónica:** `cubic-bezier(0.16, 1, 0.3, 1)` para todas las interacciones hover, apertura de modales y transiciones de tamaño.
- **Micro-Depresión:** Todos los elementos interactivos se hunden `scale(0.98)` o `scale(0.975)` al ser presionados.
- **Tooltips Flotantes:** Aparecen con fade suave y elevación de abajo hacia arriba con backdrop blur.

---

## 6. 🛡️ Reglas de Oro para Desarrolladores & IAs Futuras

1. ❌ **PROHIBIDO:** Usar `background: rgba(255,255,255,0.05)` sin un bisel de luz interior superior o sombra de profundidad.
2. ❌ **PROHIBIDO:** Usar solo fuentes genéricas de sistema o degradados cian/violeta saturados genéricos.
3. ❌ **PROHIBIDO:** Usar `transition: all 0.3s ease` estándar sin la curva `var(--ease-spring)`.
4. ✅ **OBLIGATORIO:** Usar tokens CSS oficiales de `globals.css`.
5. ✅ **OBLIGATORIO:** Mostrar fórmulas gramaticales y números de clase siempre con `var(--font-mono)`.
6. ✅ **OBLIGATORIO:** Preservar la integridad de los datos y engranajes de backend (Supabase/Airtable) en toda modificación visual.
