// SVG illustration for auth pages – circuit board / electronics theme
export default function HeroIllustration() {
  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden flex flex-col items-center justify-center p-8 circuit-bg">

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-72 h-72 rounded-full opacity-20"
           style={{ background: 'radial-gradient(circle, #2196F3 0%, transparent 70%)' }} />

      {/* Top badge */}
      <div className="relative z-10 mb-8 flex items-center gap-3
                      bg-white/10 backdrop-blur-sm border border-white/20
                      rounded-full px-5 py-2.5">
        <SwapLogo size={28} />
        <span className="text-white font-bold text-lg tracking-wide font-display">SwapIT</span>
        <span className="text-white/50 text-xs font-medium">BUAP</span>
      </div>

      {/* Central graphic */}
      
      {/* Bottom tagline */}
      <div className="relative z-10 mt-6 text-center">
        <p className="text-white/80 text-sm font-medium leading-snug">
          Intercambia hardware con la<br/>comunidad de la FCC BUAP
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {['Seguro', 'Ecológico', 'Hiperlocal'].map(tag => (
            <span key={tag}
                  className="text-[10px] font-semibold text-white/60 border border-white/20
                             rounded-full px-2.5 py-0.5">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Inline SwapIT logo
function SwapLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="16" fill="rgba(33,150,243,0.25)"/>
      <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
      <path d="M10 14 L16 9 L22 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M22 18 L16 23 L10 18" stroke="rgba(33,150,243,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.8"/>
    </svg>
  )
}
