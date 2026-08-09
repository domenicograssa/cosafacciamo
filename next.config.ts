import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // immagini eventi (già compresse lato client)
    },
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
