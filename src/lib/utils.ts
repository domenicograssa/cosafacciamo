export function formatData(dateStr: string, opzioni?: Intl.DateTimeFormatOptions): string {
  const data = new Date(dateStr)
  return data.toLocaleDateString('it-IT', opzioni ?? {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export function formatOra(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('it-IT', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatPrezzo(min: number | null, max: number | null, gratuito: boolean): string {
  if (gratuito) return 'Gratuito'
  if (min === null) return 'Prezzo da definire'
  if (max && max > min) return `da € ${min}`
  return `€ ${min}`
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
