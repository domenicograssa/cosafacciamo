// Logo "moesco": wordmark con la "o" centrale a forma di sole che fa l'occhiolino.
// Vettoriale: nitido a qualsiasi dimensione. Colori: navy + ambra.
const NAVY = '#1B2653'
const AMBRA = '#FFAD05'

export default function LogoMoesco({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-end font-extrabold tracking-tight leading-none ${className}`}
      style={{ color: NAVY }}
    >
      mo
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="inline-block"
        style={{ height: '1.32em', margin: '0 0.04em -0.08em' }}
      >
        {/* Raggi */}
        <g stroke={AMBRA} strokeWidth="6.5" strokeLinecap="round" fill="none">
          <line x1="32" y1="4" x2="32" y2="13" />
          <line x1="14" y1="11" x2="20" y2="19" />
          <line x1="50" y1="11" x2="44" y2="19" />
        </g>
        {/* Cerchio-sole */}
        <circle cx="32" cy="43" r="17" stroke={AMBRA} strokeWidth="8.5" fill="none" />
        {/* Occhio sinistro */}
        <circle cx="26" cy="41.5" r="2.8" fill={NAVY} />
        {/* Occhiolino destro */}
        <path d="M33.5 41.5 q4.5 -3.6 9 0" stroke={NAVY} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      </svg>
      sco
    </span>
  )
}
