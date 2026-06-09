// Placeholder elegante per categoria — mostrato quando non esiste un'immagine autorizzata

interface Props {
  categoriaNome?: string
  categoriaSlug?: string
  categoriaColore?: string
  className?: string
  compact?: boolean
}

const CATEGORIA_CONFIG: Record<string, { icon: string; bg: string; label: string }> = {
  'concerti':        { icon: '🎵', bg: 'from-violet-500 to-purple-700',   label: 'Concerto' },
  'cultura':         { icon: '🏛️', bg: 'from-amber-500 to-orange-700',    label: 'Cultura' },
  'sport':           { icon: '🏆', bg: 'from-emerald-500 to-green-700',   label: 'Sport' },
  'food-wine':       { icon: '🍽️', bg: 'from-red-400 to-rose-700',        label: 'Food & Wine' },
  'escursioni':      { icon: '🗺️', bg: 'from-teal-500 to-cyan-700',       label: 'Escursioni' },
  'per-famiglie':    { icon: '👨‍👩‍👧', bg: 'from-sky-400 to-blue-600',        label: 'Famiglie' },
  'mare':            { icon: '🌊', bg: 'from-cyan-400 to-blue-700',       label: 'Mare' },
  'nightlife':       { icon: '🌙', bg: 'from-indigo-600 to-slate-900',    label: 'Nightlife' },
  'mostre':          { icon: '🖼️', bg: 'from-pink-400 to-fuchsia-700',    label: 'Mostra' },
  'natura':          { icon: '🌿', bg: 'from-lime-500 to-green-700',      label: 'Natura' },
  'archeologia':     { icon: '🏺', bg: 'from-yellow-600 to-amber-800',    label: 'Archeologia' },
  'outdoor':         { icon: '⛰️', bg: 'from-stone-400 to-stone-700',     label: 'Outdoor' },
  'borghi':          { icon: '🏘️', bg: 'from-orange-400 to-amber-700',    label: 'Borghi' },
  'panorami':        { icon: '👁️', bg: 'from-blue-400 to-indigo-700',     label: 'Panorami' },
  'arte':            { icon: '🎨', bg: 'from-fuchsia-400 to-pink-700',    label: 'Arte' },
  'benessere':       { icon: '💚', bg: 'from-green-400 to-teal-700',      label: 'Benessere' },
  'isole':           { icon: '⚓', bg: 'from-blue-500 to-cyan-700',       label: 'Isole' },
  'cinema':          { icon: '🎬', bg: 'from-slate-500 to-gray-800',      label: 'Cinema' },
}

const DEFAULT_CONFIG = { icon: '📅', bg: 'from-gray-400 to-gray-600', label: 'Evento' }

export default function EventImagePlaceholder({
  categoriaNome,
  categoriaSlug,
  categoriaColore,
  className = '',
  compact = false,
}: Props) {
  const key = categoriaSlug ?? ''
  const config = CATEGORIA_CONFIG[key] ?? DEFAULT_CONFIG

  // Se c'è un colore custom dalla categoria, usiamo un gradiente monocromatico
  const bgStyle = categoriaColore
    ? { background: `linear-gradient(135deg, ${categoriaColore}cc, ${categoriaColore})` }
    : undefined

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${categoriaColore ? '' : config.bg} ${className}`}
      style={bgStyle}
      aria-label={`Immagine non disponibile — ${categoriaNome ?? config.label}`}
    >
      <span className={compact ? 'text-2xl' : 'text-4xl'}>{config.icon}</span>
      {!compact && (
        <p className="mt-2 text-white/80 text-xs font-semibold uppercase tracking-widest">
          {categoriaNome ?? config.label}
        </p>
      )}
    </div>
  )
}
