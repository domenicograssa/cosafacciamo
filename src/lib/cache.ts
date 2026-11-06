import { revalidatePath as revalidatePathNext } from 'next/cache'

// ─── Invalidazione della cache delle pagine ──────────────────────────────
// Le pagine pubbliche stanno sotto src/app/[lang]: il middleware riscrive
// /eventi/x in /it/eventi/x e serve /en/eventi/x così com'è, e la cache di
// Next le conserva con quei percorsi interni. Questa funzione accetta il
// percorso "visibile" (es. '/eventi/x', lo stesso che si apre nel browser) e
// invalida entrambe le lingue. Admin, area organizzatori e API non hanno la
// lingua nel percorso e passano così come sono.
const SENZA_LINGUA = ['/admin', '/dashboard', '/accedi', '/api']

export function percorsiDaInvalidare(path: string): string[] {
  if (SENZA_LINGUA.some(p => path === p || path.startsWith(p + '/'))) return [path]
  const senzaPrefisso = path.replace(/^\/(it|en)(?=\/|$)/, '') || '/'
  const coda = senzaPrefisso === '/' ? '' : senzaPrefisso
  return [`/it${coda}`, `/en${coda}`]
}

export function revalidatePath(path: string): void {
  for (const p of percorsiDaInvalidare(path)) revalidatePathNext(p)
}
