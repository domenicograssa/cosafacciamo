'use client'

import { useLang } from '@/lib/i18n/LanguageContext'
import { RiapriCookieBanner } from '@/components/ui/CookieBanner'

export default function FooterClient() {
  const { t } = useLang()

  return (
    <footer className="bg-white border-t border-gray-100 py-10 text-sm text-gray-500">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-gray-700">
            <span className="text-amber-500">moesco</span> — {t.footer.tagline}
          </p>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <a href="/privacy-policy"           className="hover:text-amber-600 transition-colors">{t.footer.privacy}</a>
            <a href="/cookie-policy"            className="hover:text-amber-600 transition-colors">{t.footer.cookie}</a>
            <a href="/termini-e-condizioni"     className="hover:text-amber-600 transition-colors">{t.footer.terms}</a>
            <a href="/condizioni-organizzatori" className="hover:text-amber-600 transition-colors">{t.footer.organizers}</a>
            <a href="/contatti"                 className="hover:text-amber-600 transition-colors">{t.footer.contact}</a>
            <RiapriCookieBanner label={t.footer.manageCookies} />
          </nav>
        </div>
        <p className="mt-4 text-xs text-center text-gray-400">
          © 2026 moesco — Gestito da Domenico Grassa, Via Roma n. 53, 91014 Castellammare del Golfo (TP)
        </p>
      </div>
    </footer>
  )
}
