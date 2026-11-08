import { headers } from 'next/headers'
import { LANG_HEADER } from './lang-header'
import type { Lang } from './strings'

/**
 * Lingua delle pagine pubbliche, presa dal segmento [lang] della rotta.
 * Il middleware riscrive /qualcosa in /it/qualcosa e lascia /en/qualcosa
 * com'è, quindi il parametro vale sempre 'it' o 'en'.
 * Va usata nelle pagine e nei layout: NON legge headers(), così le pagine
 * restano statiche e si rigenerano solo ogni tanto (revalidate).
 */
export async function langDaParams(params: Promise<{ lang?: string }>): Promise<Lang> {
  const { lang } = await params
  return lang === 'en' ? 'en' : 'it'
}

/**
 * Lingua letta dall'header interno impostato dal middleware.
 * Solo per le Server Action, che sono comunque dinamiche: usata in una pagina
 * la renderebbe dinamica (rigenerata a ogni visita, CPU di Vercel).
 */
export async function getLang(): Promise<Lang> {
  const h = await headers()
  return h.get(LANG_HEADER) === 'en' ? 'en' : 'it'
}
