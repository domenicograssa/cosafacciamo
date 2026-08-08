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
  async headers() {
    return [
      {
        // Segnale esplicito di lingua a livello HTTP (oltre a <html lang>,
        // notranslate e cookie moesco_lang) per i webview/in-app browser che
        // ignorano i meta tag ma leggono l'header di risposta.
        source: '/:path*',
        headers: [
          { key: 'Content-Language', value: 'it' },
        ],
      },
    ];
  },
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
