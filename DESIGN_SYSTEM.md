# 🏛️ LinguaLife Design System: Celadon Claymorphism & High-Craft Studio
> **Versión:** 2.0.0 (Celadon Dual Theme Release)  
> **Inspiración:** TemplateMo 633 Celadon + Studio High-Craft  
> **Propósito:** Guía de diseño canónica con soporte dual para **Modo Claro (Celadon Soft Pastel Canvas)** y **Modo Oscuro (Celadon Obsidian / Deep Nocturne)**, eliminando la estética genérica de IA mediante física táctil, claymorphism, flat gloss, y barridos especulares de luz (*specular sheen sweep*).

---

## 1. 🧬 Filosofía Visual & Lenguaje Celadon

LinguaLife combina la pedagogía de alta retención del Método LDS con el diseño **Claymorphic & Flat Gloss** de Celadon:

1. **Claymorphism Táctil & Superficies Esculpidas:**  
   - Placas redondeadas (`--r: 28px; --r-sm: 18px;`) con sombras multidireccionales (`--clay` y `--clay-sm`).
   - Pozos hundidos interiores (`--well`) para chips, tracks, inputs y selectores activos.
2. **Iluminación Flat Gloss con Bisel Táctil:**  
   - Gradientes de luminancia con quiebre exacto al 46% (`--gloss`, `--gloss-plate`, `--gloss-jade`, `--gloss-amber`).
   - Biseles de luz perimetral (`--lip`, `--lip-jade`, `--lip-amber`) que otorgan volumen y masa física a los botones y tarjetas.
3. **Barrido Especular en Interacciones (`Specular Sheen Sweep`):**  
   - Los botones interactivos (`.cel-btn`, `.btn`) poseen un gradiente especular horizontal (`--sheen`) que se desplaza suavemente al hacer hover (`background-position: 135% 0`).
4. **Dualidad Cromática: Modo Claro & Modo Oscuro:**  
   - **Modo Claro (Celadon Soft Pastel):** Fondo pastel `#E8EDF7` con halos ambientales celadón/cielo/coral, placas `#F3F6FD`, acento verde jade `#7CCFB0` y ámbar cálido `#D97706`.
   - **Modo Oscuro (Celadon Obsidian):** Fondo pizarra profundo `#090C10` con halos sutiles, placas obsidiana `#131822`, biseles reflectivos, esmeralda `#34D399` y ámbar solar `#F59E0B`.
5. **Jerarquía Tipográfica Editorial:**  
   - `Outfit`: Títulos display principales y numerales de impacto.  
   - `Plus Jakarta Sans` / `Albert Sans`: Encabezados de componentes, tarjetas y navegación.  
   - `Inter`: Cuerpo de texto y prosa pedagógica.  
   - `JetBrains Mono`: Fórmulas sintácticas LDS (S+T+A), identificadores `#01`, PINs y métricas.

---

## 2. 🎨 Tokens Semánticos Duales

```css
/* ── MODO CLARO (Celadon Soft) ── */
[data-theme="light"] {
  --canvas: #E8EDF7;
  --plate: #F3F6FD;
  --plate-2: #EAF0FA;
  --sunk: #DCE4F3;
  --ink: #1E293B;
  --ink-2: #64748B;
  --jade: #7CCFB0;
  --jade-ink: #1B5E4A;
  --amber: #D97706;

  --clay: 0 22px 38px -20px rgba(35, 45, 60, 0.36), 0 8px 16px -10px rgba(35, 45, 60, 0.18), inset 2px 3px 4px 0 rgba(255, 255, 255, 0.95), inset -3px -5px 9px 0 rgba(35, 45, 60, 0.09);
  --well: inset 4px 5px 11px -3px rgba(35, 45, 60, 0.22), inset -2px -3px 6px 0 rgba(255, 255, 255, 0.9);
  --gloss: linear-gradient(180deg, #FEFEFF 0%, #F5F8FD 46%, #E9EFFA 46.01%, #DEE7F6 100%);
  --lip: inset 0 1px 0 0 rgba(255, 255, 255, 1), inset 0 -1px 0 0 rgba(35, 45, 60, 0.12);
}

/* ── MODO OSCURO (Celadon Obsidian) ── */
[data-theme="dark"], .dark {
  --canvas: #090C10;
  --plate: #131822;
  --plate-2: #1A2130;
  --sunk: #0B0F16;
  --ink: #F1F5F9;
  --ink-2: #94A3B8;
  --jade: #34D399;
  --jade-ink: #A7F3D0;
  --amber: #F59E0B;

  --clay: 0 22px 40px -20px rgba(0, 0, 0, 0.85), 0 8px 16px -10px rgba(0, 0, 0, 0.6), inset 1px 2px 3px 0 rgba(255, 255, 255, 0.12), inset -3px -5px 9px 0 rgba(0, 0, 0, 0.7);
  --well: inset 4px 5px 11px -3px rgba(0, 0, 0, 0.8), inset -1px -2px 4px 0 rgba(255, 255, 255, 0.06);
  --gloss: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 46%, rgba(255, 255, 255, 0.01) 46.01%, rgba(0, 0, 0, 0.35) 100%);
  --lip: inset 0 1px 0 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 0 rgba(0, 0, 0, 0.7);
}
```

---

## 3. 🎴 Catálogo de Componentes Celadon

### 3.1. Botones Celadon con Barrido Especular (`.cel-btn`)
```html
<!-- Botón Primario Jade -->
<button class="cel-btn solid">Comenzar Gratis ✨</button>

<!-- Botón Ámbar Studio -->
<button class="cel-btn amber">Inscribirme Ahora</button>

<!-- Botón Base Gloss -->
<button class="cel-btn">Ver Diapositivas</button>
```

### 3.2. Tarjetas Claymorphism (`.cel-clay` & `.cel-clay-sm`)
Superficies con volumen tridimensional esculpido y sombras reactivas.

### 3.3. Pozos Hundidos (`.cel-well`)
Contenedores para estados activos, badges, barras de progreso y toggles.

### 3.4. Selector de Tema (`<ThemeToggle />`)
Componente interactivo táctil para alternar entre Modo Claro ☀️ y Modo Oscuro 🌙 con persistencia en `localStorage`.

---

## 4. 🛡️ Reglas de Oro

1. ✅ **OBLIGATORIO:** Usar tokens CSS semánticos (`var(--canvas)`, `var(--plate)`, `var(--ink)`, `var(--clay)`).
2. ✅ **OBLIGATORIO:** Mantener la compatibilidad automática en ambos modos (Claro y Oscuro).
3. ❌ **PROHIBIDO:** Usar colores oscuros o blancos fijos en backgrounds sin usar variables semánticas.
4. ✅ **OBLIGATORIO:** Preservar la integridad de los datos y engranajes de backend (Supabase/Airtable).
