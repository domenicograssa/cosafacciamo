'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Lang, strings } from './strings'
import { localizzaPath } from './lang-header'

interface LanguageContextType {
  lang: Lang
  t: typeof strings['it']
  setLang: (lang: Lang) => void
  /**
   * Prefissa un percorso interno con /en quando la lingua attiva è l'inglese.
   * Da usare per OGNI Link interno dei componenti pubblici: essendo la lingua
   * legata solo all'indirizzo (niente più cookie di redirect), un link scritto
   * a mano come "/eventi" riporterebbe l'utente inglese sulla versione italiana.
   */
  href: (path: string) => string
}

// Definita in lang-header.ts (modulo neutro) così è utilizzabile anche dai
// Server Component senza trascinare questo file 'use client'.
export { localizzaPath }

const LanguageContext = createContext<LanguageContextType>({
  lang: 'it',
  t: strings.it,
  setLang: () => {},
  href: (p) => p,
})

// La lingua "vera" è determinata lato server dal prefisso /en dell'indirizzo
// (vedi middleware.ts). initialLang arriva già corretta dal RootLayout (Server
// Component) tramite getLang(), così non c'è alcun flash di contenuto nella
// lingua sbagliata.
export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()
  const pathname = usePathname()

  // Sincronizza lo stato quando cambia la pagina: essendo la lingua legata
  // all'indirizzo, navigando da /eventi a /en/eventi il layout passa una
  // initialLang diversa e lo stato locale deve seguirla.
  if (lang !== initialLang) setLangState(initialLang)

  const setLang = (l: Lang) => {
    if (l === lang) return
    setLangState(l)
    // Nessun cookie: cambiare lingua = andare sull'indirizzo dell'altra lingua.
    // Se l'utente torna domani su moesco.it vedrà l'italiano, come chiunque
    // altro apra quell'indirizzo. Vedi la nota in middleware.ts sul perché il
    // cookie è stato eliminato.
    const senzaPrefisso = pathname.startsWith('/en') ? (pathname.slice(3) || '/') : pathname
    const destinazione = l === 'en' ? `/en${senzaPrefisso === '/' ? '' : senzaPrefisso}` : senzaPrefisso
    router.push(destinazione || '/')
  }

  return (
    <LanguageContext.Provider
      value={{ lang, t: strings[lang], setLang, href: (p) => localizzaPath(p, lang) }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
