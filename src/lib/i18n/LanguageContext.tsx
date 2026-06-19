'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('it')

  useEffect(() => {
    // 1. Leggi preferenza salvata
    const saved = localStorage.getItem('moesco_lang') as Lang | null
    if (saved === 'it' || saved === 'en') {
      setLangState(saved)
      return
    }
    // 2. Rileva lingua del browser
    const browserLang = navigator.language?.toLowerCase() ?? ''
    if (!browserLang.startsWith('it')) {
      setLangState('en')
    }
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('moesco_lang', l)
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
