import React, { useId } from 'react'
import {
  BRAND_LOGO_PATHS,
  BRAND_LOGO_VIEWBOX_FULL,
  BRAND_LOGO_VIEWBOX_ISO
} from '@/lib/brand-logo-paths'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'default' | 'mono-dark' | 'mono-light' | 'accent-cyan' | 'accent-pink' | 'accent-amber'
  className?: string
}

export function LinguaLifeLogo({
  size = 'md',
  showText = true,
  variant = 'default',
  className
}: LogoProps) {
  const uid = useId().replace(/:/g, '')
  const heights = { sm: 28, md: 36, lg: 46 }
  const h = heights[size]

  const isMonoDark = variant === 'mono-dark'
  const isMonoLight = variant === 'mono-light'

  const linguaColor =
    isMonoDark ? '#333333' :
    isMonoLight ? '#FFFFFF' :
    'var(--text-primary, #333333)'

  const lifeColor =
    variant === 'accent-cyan' ? '#1AC1E7' :
    variant === 'accent-pink' ? '#FF5076' :
    variant === 'accent-amber' ? '#FDBA3B' :
    linguaColor

  const renderBubble = () => {
    if (isMonoDark || isMonoLight) {
      return (
        <path
          d={BRAND_LOGO_PATHS.monoBubbleD}
          fill={isMonoLight ? '#FFFFFF' : '#333333'}
          fillRule="evenodd"
        />
      )
    }

    if (variant === 'accent-cyan') {
      return (
        <>
          <path d={BRAND_LOGO_PATHS.monoBubbleD} fill={`url(#llCyanOnly-${uid})`} fillRule="evenodd" />
        </>
      )
    }
    if (variant === 'accent-pink') {
      return (
        <>
          <path d={BRAND_LOGO_PATHS.monoBubbleD} fill={`url(#llPinkOnly-${uid})`} fillRule="evenodd" />
        </>
      )
    }
    if (variant === 'accent-amber') {
      return (
        <>
          <path d={BRAND_LOGO_PATHS.monoBubbleD} fill={`url(#llYellowOnly-${uid})`} fillRule="evenodd" />
        </>
      )
    }

    return (
      <>
        <path d={BRAND_LOGO_PATHS.shape1D} fill={`url(#llY-${uid})`} />
        <path d={BRAND_LOGO_PATHS.shape2D} fill={`url(#llPC-${uid})`} />
        <path d={BRAND_LOGO_PATHS.shape3D} fill={`url(#llPM-${uid})`} />
        <path
          d={BRAND_LOGO_PATHS.shadowD}
          fill={`url(#llSh-${uid})`}
          opacity={0.32}
          style={{ mixBlendMode: 'multiply' }}
        />
        <path d={BRAND_LOGO_PATHS.letterLD} fill="#FFFFFF" />
      </>
    )
  }

  const gY = BRAND_LOGO_PATHS.gradients.gYellow
  const gPC = BRAND_LOGO_PATHS.gradients.gPurpleCyan
  const gPM = BRAND_LOGO_PATHS.gradients.gPinkMint
  const gSh = BRAND_LOGO_PATHS.gradients.gShadow

  const viewBox = showText ? BRAND_LOGO_VIEWBOX_FULL : BRAND_LOGO_VIEWBOX_ISO
  const width = showText ? Math.round((694 / 153) * h) : Math.round((148 / 153) * h)

  return (
    <svg
      width={width}
      height={h}
      viewBox={viewBox}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, userSelect: 'none' }}
      role="img"
      aria-label="LinguaLife"
    >
      <defs>
        <linearGradient id={`llY-${uid}`} gradientUnits="userSpaceOnUse" x1={gY.x1} y1={gY.y1} x2={gY.x2} y2={gY.y2}>
          <stop offset="0%" stopColor="#FDB93A" />
          <stop offset="7.54%" stopColor="#FDB93A" />
          <stop offset="100%" stopColor="#E6F07F" />
        </linearGradient>
        <linearGradient id={`llPC-${uid}`} gradientUnits="userSpaceOnUse" x1={gPC.x1} y1={gPC.y1} x2={gPC.x2} y2={gPC.y2}>
          <stop offset="0%" stopColor="#972FC2" />
          <stop offset="19.83%" stopColor="#972FC2" />
          <stop offset="48.32%" stopColor="#6C35CE" />
          <stop offset="74.86%" stopColor="#20A9E3" />
          <stop offset="100%" stopColor="#12DEEC" />
        </linearGradient>
        <linearGradient id={`llPM-${uid}`} gradientUnits="userSpaceOnUse" x1={gPM.x1} y1={gPM.y1} x2={gPM.x2} y2={gPM.y2}>
          <stop offset="0%" stopColor="#FF5076" />
          <stop offset="19.83%" stopColor="#FF5076" />
          <stop offset="48.32%" stopColor="#E1509D" />
          <stop offset="74.86%" stopColor="#80A4C3" />
          <stop offset="100%" stopColor="#79F7D3" />
        </linearGradient>
        <linearGradient id={`llSh-${uid}`} gradientUnits="userSpaceOnUse" x1={gSh.x1} y1={gSh.y1} x2={gSh.x2} y2={gSh.y2}>
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="19.83%" stopColor="#FFFFFF" stopOpacity={0} />
          <stop offset="99.44%" stopColor="#000000" stopOpacity={1} />
          <stop offset="100%" stopColor="#000000" stopOpacity={1} />
        </linearGradient>
        <linearGradient id={`llCyanOnly-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1AC1E7" />
          <stop offset="100%" stopColor="#8C31C5" />
        </linearGradient>
        <linearGradient id={`llPinkOnly-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5076" />
          <stop offset="100%" stopColor="#80A4C3" />
        </linearGradient>
        <linearGradient id={`llYellowOnly-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDBA3B" />
          <stop offset="100%" stopColor="#E6F07F" />
        </linearGradient>
      </defs>

      {renderBubble()}

      {showText && (
        <>
          <g fill={linguaColor}>
            {BRAND_LOGO_PATHS.linguaPaths.map((d, idx) => (
              <path key={`lg-${idx}`} d={d} />
            ))}
          </g>
          <g fill={lifeColor}>
            {BRAND_LOGO_PATHS.lifePaths.map((d, idx) => (
              <path key={`lf-${idx}`} d={d} />
            ))}
          </g>
        </>
      )}
    </svg>
  )
}
