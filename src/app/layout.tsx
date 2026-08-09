import type { Metadata, Viewport } from "next";
import { Nunito } from 'next/font/google'
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import CookieBanner from "@/components/ui/CookieBanner";
import Analytics from "@/components/Analytics";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import FooterClient from "@/components/layout/FooterClient";
import { getLang } from "@/lib/i18n/getLang";
import RegistraServiceWorker from "@/components/pwa/RegistraServiceWorker";
import BannerInstallaApp from "@/components/pwa/BannerInstallaApp";

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800'],
  variable: '--font-nunito',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const isEn = lang === 'en'

  return {
    metadataBase: new URL('https://www.moesco.it'),
    title: {
      default: isEn
        ? 'Moesco — Events, festivals and things to do around Trapani, Sicily'
        : 'Moesco — Eventi, sagre e cose da fare in provincia di Trapani e dintorni',
      template: '%s | Moesco',
    },
    description: isEn
      ? 'Discover events, festivals, concerts, theatre, markets and things to do around the province of Trapani, Sicily.'
      : 'Scopri eventi, sagre, concerti, festival, teatro, mercatini e cose da fare in provincia di Trapani e dintorni.',
    alternates: {
      languages: {
        'it': 'https://www.moesco.it',
        'en': 'https://www.moesco.it/en',
      },
    },
    openGraph: {
      siteName: 'Moesco',
      locale: isEn ? 'en_US' : 'it_IT',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      other: { 'msvalidate.01': '0ADFAC900C27C8CF8C5CDF8579C59B6B' },
    },
    other: {
      google: 'notranslate',
    },
    // ─── App installabile su smartphone e tablet (PWA) ──────────────────
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: 'moesco',
      statusBarStyle: 'default',
    },
    icons: {
      icon: [
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
  }
}

// Colore della barra di sistema quando il sito gira come app installata.
export const viewport: Viewport = {
  themeColor: '#1B2653',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang()

  return (
    <html lang={lang} translate="no" className={`h-full notranslate ${nunito.variable}`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <LanguageProvider initialLang={lang}>
          {/*
            "Salta al contenuto": primo elemento raggiungibile con Tab.
            Senza di esso, chi naviga da tastiera o con screen reader deve
            riattraversare l'intero menu a ogni cambio pagina prima di
            arrivare al contenuto (WCAG 2.1 A, criterio 2.4.1).
            È invisibile finché non riceve il fuoco.
          */}
          <a
            href="#contenuto-principale"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[10000] focus:rounded-lg focus:bg-[#1B2653] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          >
            {lang === 'en' ? 'Skip to main content' : 'Salta al contenuto principale'}
          </a>
          <Navbar />
          <main id="contenuto-principale" tabIndex={-1} className="flex-1">{children}</main>
          <FooterClient />
          <CookieBanner />
          <Analytics />
          <RegistraServiceWorker />
          <BannerInstallaApp />
        </LanguageProvider>
      </body>
    </html>
  );
}
