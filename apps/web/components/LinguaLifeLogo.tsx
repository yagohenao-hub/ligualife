import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function LinguaLifeLogo({ size = 'md', showText = true, className }: LogoProps) {
  const badgeDimensions = {
    sm: { box: 30, fontSize: '0.8rem', radius: 8 },
    md: { box: 38, fontSize: '1rem', radius: 11 },
    lg: { box: 46, fontSize: '1.2rem', radius: 14 }
  }[size]

  return (
    <div 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.5rem' : '0.75rem',
        textDecoration: 'none',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          width: badgeDimensions.box,
          height: badgeDimensions.box,
          borderRadius: badgeDimensions.radius,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #4C1D95 100%)',
          border: '1px solid rgba(196, 181, 253, 0.35)',
          boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 800,
          fontFamily: 'var(--font-heading, Outfit, sans-serif)',
          fontSize: badgeDimensions.fontSize,
          letterSpacing: '-0.03em',
          position: 'relative',
          flexShrink: 0
        }}
      >
        <span style={{ transform: 'translateY(-0.5px)' }}>LL</span>
      </div>

      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-heading, Outfit, sans-serif)',
            fontSize: size === 'sm' ? '1.15rem' : size === 'lg' ? '1.6rem' : '1.35rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1
          }}
        >
          Lingua<span style={{ color: 'var(--accent-primary, #8B5CF6)' }}>Life</span>
        </span>
      )}
    </div>
  )
}
