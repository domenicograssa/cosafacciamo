import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NON IMPOSTATO'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'NON IMPOSTATO'
  const adminEmail = process.env.ADMIN_EMAIL ?? 'NON IMPOSTATO'

  return NextResponse.json({
    supabase_url: url,
    anon_key_prefix: key.slice(0, 40) + '...',
    admin_email: adminEmail,
  })
}
