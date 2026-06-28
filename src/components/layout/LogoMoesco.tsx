// Logo "moesco" — wordmark con sole-faccina al centro.
// Font: Nunito 800 (caricato via next/font in layout.tsx → var(--font-nunito))
// Colori: navy #1B2653, ambra #FFAD05

const NAVY  = '#1B2653'
const AMBRA = '#FFAD05'

export default function LogoMoesco({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center leading-none ${className}`}
      style={{
        fontFamily: "var(--font-nunito, 'Nunito', sans-serif)",
        fontWeight: 800,
        color: NAVY,
        letterSpacing: '-0.01em',
      }}
    >
      mo
      {/* Sole-faccina — sostituisce la "e" */}
      <svg
        viewBox="0 0 72 80"
        aria-hidden="true"
        className="inline-block"
        style={{ height: '1.25em', margin: '0 0.02em -0.04em' }}
      >
        {/* Raggi solari — 5 raggi nella metà superiore */}
        <g stroke={AMBRA} strokeWidth="6" strokeLinecap="round" fill="none">
          {/* centro */}
          <line x1="36" y1="4"  x2="36" y2="14" />
          {/* sinistra */}
          <line x1="14" y1="10" x2="20" y2="19" />
          {/* destra */}
          <line x1="58" y1="10" x2="52" y2="19" />
          {/* sinistra larga */}
          <line x1="5"  y1="28" x2="14" y2="31" />
          {/* destra larga */}
          <line x1="67" y1="28" x2="58" y2="31" />
        </g>
        {/* Cerchio-sole — aperto a sinistra come la "e", chiude a destra */}
        <path
          d="M20 37 a18 18 0 1 1 0 20"
          stroke={AMBRA}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        {/* Occhio sinistro — punto pieno */}
        <circle cx="30" cy="45" r="3" fill={NAVY} />
        {/* Occhiolino destro — linea curva */}
        <path
          d="M38 43 q5 -3 9 2"
          stroke={NAVY}
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Sorriso inferiore */}
        <path
          d="M25 56 q11 8 22 0"
          stroke={AMBRA}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      sco
    </span>
  )
}
