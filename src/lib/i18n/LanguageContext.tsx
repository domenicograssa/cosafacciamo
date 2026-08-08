'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Lang, strings } from './strings'

interface LanguageContextType {
  lang: Lang
  t: typeof strings['it']
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'it',
  t: strings.it,
  setLang: () => {},
})

// La lingua "vera" è determinata lato server dal prefisso /en (vedi
// middleware.ts, che imposta anche il cookie moesco_lang_v2 in modo coerente).
// initialLang arriva già corretta dal RootLayout (Server Component) tramite
// getLang(), così non c'è alcun flash di contenuto nella lingua sbagliata.
export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()
  const pathname = usePathname()

  const setLang = (l: Lang) => {
    if (l === lang) return
    setLangState(l)
    // Il cookie garantisce che il prossimo giro (anche su un'altra pagina o
    // dopo un refresh) l'utente resti sulla lingua scelta manualmente.
    document.cookie = `moesco_lang_v2=${l}; path=/; max-age=${60 * 60 * 24 * 365}`
    const senzaPrefisso = pathname.startsWith('/en') ? (pathname.slice(3) || '/') : pathname
    const destinazione = l === 'en' ? `/en${senzaPrefisso === '/' ? '' : senzaPrefisso}` : senzaPrefisso
    router.push(destinazione || '/')
  }

  return (
    <LanguageContext.Provider value={{ lang, t: strings[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
