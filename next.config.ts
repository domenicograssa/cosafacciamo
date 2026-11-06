import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// ─── Content Security Policy ────────────────────────────────────────────────
// Obiettivo: impedire il caricamento di script/risorse da domini non previsti
// (difesa contro XSS e injection di terze parti) senza rompere nulla di ciò che
// il sito usa davvero: Google Analytics (solo dopo consenso), Supabase per dati
// e immagini, i domini immagine già dichiarati in `images.remotePatterns`, il
// service worker della PWA.
//
// Nota su 'unsafe-inline' negli script: Next.js inietta script inline per
// l'idratazione. Eliminarli richiederebbe i nonce e una riscrittura del
// middleware; qui si sceglie la via che non rischia di rompere il sito. Anche
// con 'unsafe-inline', la direttiva continua a bloccare il caricamento di
// script ospitati su domini estranei, che è l'attacco più probabile.
// 'unsafe-eval' serve solo al refresh rapido in sviluppo: in produzione è escluso.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://*.google-analytics.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  // Impedisce che il sito venga incorniciato in un iframe altrui (clickjacking).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Blocca il "MIME sniffing": il browser rispetta il Content-Type dichiarato.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Non trasmette il percorso completo ai siti esterni su cui l'utente clicca:
  // gli URL possono contenere informazioni sulla navigazione dell'utente.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Nessuna funzionalità del sito richiede fotocamera, microfono o geolocalizzazione.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // immagini eventi (già compresse lato client)
    },
  },
  async headers() {
    return [
      {
        // Applica gli header di sicurezza a tutte le risposte del sito.
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Il vecchio dominio Vercel (prima del passaggio a moesco.it) restava online
      // in parallelo a www.moesco.it, servendo contenuto duplicato a Google.
      // Redirect 308 verso il dominio definitivo, preservando path e query string.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'cosafacciamo.vercel.app' }],
        destination: 'https://www.moesco.it/:path*',
        permanent: true,
      },
    ];
  },
  // NB: l'header Content-Language NON si imposta qui. Fino al 9/8/2026 questo
  // blocco marcava 'it' TUTTE le pagine, comprese quelle /en — dichiarando
  // quindi come italiane anche le pagine inglesi, il che spingeva i browser
  // in-app a proporne la traduzione automatica. Ora lo imposta il middleware
  // con il valore giusto per ciascuna lingua (vedi src/middleware.ts).
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'commons.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'irtewoirgrberzlvsxso.supabase.co',
      },
    ],
  },
};

export default nextConfig;
