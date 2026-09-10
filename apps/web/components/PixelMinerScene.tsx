import React from 'react'

export function PixelMinerScene() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 400 140"
        style={{ width: '100%', height: '100%', display: 'block', shapeRendering: 'crispEdges' }}
      >
        <defs>
          <style>{`
            /* Pickaxe swing animation */
            @keyframes swingPickaxe {
              0% { transform: rotate(0deg); }
              40% { transform: rotate(-45deg); }
              50% { transform: rotate(25deg); }
              60% { transform: rotate(20deg); }
              100% { transform: rotate(0deg); }
            }

            /* Spark animation on impact */
            @keyframes sparkParticle {
              0%, 48% { opacity: 0; transform: translate(0, 0) scale(0); }
              52% { opacity: 1; transform: translate(-8px, -12px) scale(1); }
              70% { opacity: 0.8; transform: translate(-16px, -24px) scale(0.8); }
              100% { opacity: 0; transform: translate(-24px, -32px) scale(0); }
            }

            @keyframes sparkParticleRight {
              0%, 48% { opacity: 0; transform: translate(0, 0) scale(0); }
              52% { opacity: 1; transform: translate(10px, -10px) scale(1); }
              70% { opacity: 0.8; transform: translate(20px, -20px) scale(0.8); }
              100% { opacity: 0; transform: translate(28px, -28px) scale(0); }
            }

            /* Shovel dig animation */
            @keyframes digShovel {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              30% { transform: translate(-2px, -6px) rotate(-15deg); }
              50% { transform: translate(4px, 4px) rotate(10deg); }
              70% { transform: translate(-2px, -2px) rotate(0deg); }
            }

            /* Floating Gem Pulse */
            @keyframes gemGlow {
              0%, 100% { filter: drop-shadow(0 0 3px #10b981); opacity: 0.85; }
              50% { filter: drop-shadow(0 0 10px #34d399); opacity: 1; }
            }

            /* Miner bobbing */
            @keyframes minerBob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-2px); }
            }

            .pickaxe-arm {
              transform-origin: 105px 75px;
              animation: swingPickaxe 1.6s infinite cubic-bezier(0.4, 0, 0.2, 1);
            }

            .spark-1 { animation: sparkParticle 1.6s infinite ease-out; }
            .spark-2 { animation: sparkParticleRight 1.6s infinite ease-out; }

            .shovel-arm {
              transform-origin: 295px 75px;
              animation: digShovel 1.8s infinite ease-in-out;
            }

            .gem-glowing { animation: gemGlow 2s infinite ease-in-out; }
            .miner-body { animation: minerBob 2s infinite ease-in-out; }
          `}</style>

          {/* Pixel Crystal Gradient Pattern */}
          <linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Cave background grid elements */}
        <rect x="20" y="30" width="8" height="8" fill="#1e293b" opacity="0.5" />
        <rect x="80" y="20" width="12" height="12" fill="#1e293b" opacity="0.4" />
        <rect x="320" y="25" width="10" height="10" fill="#1e293b" opacity="0.5" />
        <rect x="360" y="40" width="6" height="6" fill="#1e293b" opacity="0.6" />

        {/* Cave ceiling Stalactites (Pixel Art) */}
        <path d="M40,0 L48,0 L44,16 Z M180,0 L192,0 L186,22 Z M290,0 L298,0 L294,14 Z" fill="#1e293b" />

        {/* --- LEFT MINER & CRYSTAL ORE --- */}
        <g transform="translate(10, 0)">
          {/* Glowing Crystal Rock */}
          <g className="gem-glowing">
            <polygon points="50,105 62,85 74,105 68,115 56,115" fill="url(#gemGrad)" />
            <polygon points="54,95 62,85 64,105" fill="#a7f3d0" opacity="0.6" />
            <rect x="68" y="90" width="10" height="12" fill="#10b981" />
            <rect x="42" y="100" width="14" height="15" fill="#047857" />
          </g>

          {/* Rock base */}
          <path d="M35,115 L80,115 L75,100 L60,95 L40,102 Z" fill="#334155" />
          <rect x="45" y="108" width="6" height="6" fill="#1e293b" />

          {/* Spark Particles */}
          <g transform="translate(62, 90)">
            <rect className="spark-1" width="4" height="4" fill="#fbbf24" />
            <rect className="spark-2" width="4" height="4" fill="#34d399" />
            <rect className="spark-1" style={{ animationDelay: '0.1s' }} width="3" height="3" fill="#ffffff" />
          </g>

          {/* MINER 1 (Pixel Art Character) */}
          <g className="miner-body" transform="translate(90, 45)">
            {/* Hardhat / Helmet */}
            <rect x="8" y="2" width="20" height="8" fill="#f59e0b" />
            <rect x="6" y="8" width="24" height="4" fill="#d97706" />
            <rect x="16" y="0" width="4" height="4" fill="#fef08a" /> {/* Helmet Lamp */}
            <rect x="17" y="1" width="2" height="2" fill="#ffffff" />

            {/* Head */}
            <rect x="10" y="12" width="16" height="12" fill="#fde047" />
            <rect x="12" y="16" width="3" height="3" fill="#1e293b" /> {/* Eye */}
            <rect x="18" y="16" width="3" height="3" fill="#1e293b" /> {/* Eye */}

            {/* Body / Shirt (Cyan/Blue Worker) */}
            <rect x="8" y="24" width="20" height="22" fill="#0284c7" />
            <rect x="12" y="24" width="12" height="22" fill="#0369a1" />
            {/* Belt */}
            <rect x="8" y="42" width="20" height="4" fill="#475569" />
            <rect x="16" y="42" width="4" height="4" fill="#fbbf24" />

            {/* Legs */}
            <rect x="10" y="46" width="7" height="18" fill="#334155" />
            <rect x="19" y="46" width="7" height="18" fill="#1e293b" />

            {/* Boots */}
            <rect x="8" y="60" width="9" height="8" fill="#78350f" />
            <rect x="19" y="60" width="9" height="8" fill="#451a03" />

            {/* Pickaxe & Arm Group */}
            <g className="pickaxe-arm">
              {/* Arm */}
              <rect x="-4" y="24" width="14" height="6" fill="#0284c7" />
              <rect x="-8" y="26" width="6" height="6" fill="#fde047" /> {/* Hand */}
              
              {/* Pickaxe Handle */}
              <rect x="-24" y="10" width="4" height="36" fill="#78350f" transform="rotate(-35 -24 10)" />
              {/* Pickaxe Metal Head */}
              <path d="M-38,6 L-20,0 L-22,6 L-35,14 Z" fill="#94a3b8" />
              <path d="M-38,6 L-42,10 L-35,14 Z" fill="#cbd5e1" />
            </g>
          </g>
        </g>

        {/* --- CENTER FLOATING ICON / STATUS --- */}
        <g transform="translate(180, 45)">
          <rect x="0" y="0" width="40" height="40" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
          <text x="20" y="26" textAnchor="middle" fontSize="20" fill="#10b981">🚧</text>
        </g>

        {/* --- RIGHT MINER & SHOVEL / GEM CART --- */}
        <g transform="translate(230, 45)">
          {/* MINER 2 (Pixel Art Character) */}
          <g className="miner-body">
            {/* Hardhat */}
            <rect x="12" y="2" width="20" height="8" fill="#10b981" />
            <rect x="10" y="8" width="24" height="4" fill="#059669" />
            <rect x="20" y="0" width="4" height="4" fill="#6ee7b7" /> {/* Lamp */}

            {/* Head */}
            <rect x="14" y="12" width="16" height="12" fill="#fde047" />
            <rect x="16" y="16" width="3" height="3" fill="#1e293b" /> {/* Eye */}
            <rect x="22" y="16" width="3" height="3" fill="#1e293b" /> {/* Eye */}

            {/* Body (Purple/Dark Worker) */}
            <rect x="12" y="24" width="20" height="22" fill="#7c3aed" />
            <rect x="16" y="24" width="12" height="22" fill="#6d28d9" />
            {/* Belt */}
            <rect x="12" y="42" width="20" height="4" fill="#475569" />
            <rect x="20" y="42" width="4" height="4" fill="#fbbf24" />

            {/* Legs */}
            <rect x="14" y="46" width="7" height="18" fill="#1e293b" />
            <rect x="23" y="46" width="7" height="18" fill="#334155" />

            {/* Boots */}
            <rect x="14" y="60" width="9" height="8" fill="#451a03" />
            <rect x="23" y="60" width="9" height="8" fill="#78350f" />

            {/* Shovel Arm */}
            <g className="shovel-arm">
              <rect x="28" y="26" width="14" height="6" fill="#7c3aed" />
              <rect x="38" y="26" width="6" height="6" fill="#fde047" /> {/* Hand */}
              {/* Shovel Handle */}
              <rect x="42" y="14" width="4" height="40" fill="#78350f" transform="rotate(25 42 14)" />
              {/* Shovel Blade */}
              <path d="M54,46 L66,54 L60,62 L48,54 Z" fill="#94a3b8" />
            </g>
          </g>

          {/* Pixel Cart filled with glowing green ore */}
          <g transform="translate(85, 35)">
            {/* Cart body */}
            <rect x="0" y="15" width="45" height="22" fill="#475569" />
            <rect x="3" y="18" width="39" height="16" fill="#334155" />
            {/* Ore inside cart */}
            <rect x="6" y="8" width="10" height="10" fill="#10b981" className="gem-glowing" />
            <rect x="14" y="5" width="14" height="12" fill="#34d399" className="gem-glowing" />
            <rect x="26" y="9" width="12" height="9" fill="#059669" className="gem-glowing" />

            {/* Cart Wheels */}
            <circle cx="10" cy="40" r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="35" cy="40" r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
          </g>
        </g>
      </svg>
    </div>
  )
}
