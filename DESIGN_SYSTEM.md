# 🏛️ LinguaLife Design System & Arquitectura de Identidad (2 Capas)
> **Versión:** 2.1.0 (Brand Identity v1.0 + Celadon Product UI Release)  
> **Propósito:** Unificar la identidad oficial de marca (Logotipo Burbuja `L` + Paleta Vibrante + Tipografía `Andes` del Manual de Marca v1.0) con el lenguaje táctil de la aplicación web (**Celadon Claymorphism & Dual Theme**).

---

## 1. 🎯 Modelo Oficial de Dos Capas

Para proteger tanto el reconocimiento comercial de la marca como la comodidad visual en sesiones de estudio largas:

### Capa 1 · Identidad de Marca, Logotipo & Marketing (Manual Oficial v1.0)
Rige el logotipo, redes sociales, Meta Ads, WhatsApp carousels, material corporativo y presentaciones:
- **Logotipo Oficial:** Isotipo en burbuja de diálogo multicolor (`svg/png` en `/public/brand/`) con `'L'` blanca central + wordmark geométrico `LinguaLife`.
- **Paleta Vibrante Oficial:**
  - Amarillo Solar: `#FDBA3B` · `RGB(253, 186, 59)`
  - Arena / Crema Cálido: `#E7D7B3` · `RGB(231, 215, 179)`
  - Rosa / Coral Dinámico: `#FF5076` · `RGB(255, 80, 118)`
  - Púrpura Profundo: `#8C31C5` · `RGB(140, 49, 197)`
  - Cian Conversacional: `#1AC1E7` · `RGB(26, 193, 231)`
  - Neutros Oficiales: Carbón `#26292E` y Hielo Claro `#F1F5F9`
- **Tipografía de Marca & Piezas:** **`Andes`** (T1 `32px`, T2 `24px`, Body `16px`).

### Capa 2 · Sistema UI de Plataforma Web (`Celadon Claymorphism Dual Theme`)
Rige la experiencia interactiva de estudio en `/student`, `/student/vocabulary`, `/classroom` y `/dashboard` para evitar fatiga ocular y ofrecer física táctil sin estética genérica de IA:
1. **Claymorphism Táctil & Superficies Esculpidas:** Placas redondeadas (`--r: 28px; --r-sm: 18px;`) con sombras multidireccionales (`--clay`) y pozos hundidos (`--well`).
2. **Iluminación Flat Gloss con Bisel Táctil:** Gradientes con quiebre al 46% y bisel de luz perimetral (`--lip`).
3. **Barrido Especular en Interacciones (`Specular Sheen Sweep`):** Destello suave al hacer hover en `.cel-btn`.
4. **Jerarquía Tipográfica UI Digital:** `Outfit` (títulos display), `Plus Jakarta Sans` / `Albert Sans` (tarjetas y botones), `Inter` (lectura pedagógica) y `JetBrains Mono` (patrones sintácticos, PINs y métricas).

---

## 2. 🎨 Tokens Semánticos Duales (UI de Producto)

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
  --brand-cyan: #1AC1E7;
  --brand-pink: #FF5076;
  --brand-purple: #8C31C5;
  --brand-yellow: #FDBA3B;

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
  --brand-cyan: #1AC1E7;
  --brand-pink: #FF5076;
  --brand-purple: #8C31C5;
  --brand-yellow: #FDBA3B;

  --clay: 0 22px 40px -20px rgba(0, 0, 0, 0.85), 0 8px 16px -10px rgba(0, 0, 0, 0.6), inset 1px 2px 3px 0 rgba(255, 255, 255, 0.12), inset -3px -5px 9px 0 rgba(0, 0, 0, 0.7);
  --well: inset 4px 5px 11px -3px rgba(0, 0, 0, 0.8), inset -1px -2px 4px 0 rgba(255, 255, 255, 0.06);
  --gloss: linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.03) 46%, rgba(255, 255, 255, 0.01) 46.01%, rgba(0, 0, 0, 0.35) 100%);
  --lip: inset 0 1px 0 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 0 rgba(0, 0, 0, 0.7);
}
```

---

## 3. 🛡️ Reglas de Oro

1. ✅ **Logotipo Oficial:** Jamás usar siglas `"LL"` en cuadro morado; usar `<LinguaLifeLogo />` o los vectores en `apps/web/public/brand/`.
2. ✅ **Tokens Semánticos UI:** Usar `var(--canvas)`, `var(--plate)`, `var(--ink)`, `var(--clay)` para compatibilidad dual Claro/Oscuro.
3. ✅ **Protección Metodológica:** El usuario final nunca ve el término técnico `"LDS"` en piezas comerciales o UX cotidiana.
