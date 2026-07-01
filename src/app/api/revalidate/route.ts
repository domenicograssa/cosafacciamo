import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

// Utility di servizio: forza la rigenerazione di una o più pagine ISR
// (utile quando i dati vengono aggiornati via SQL diretto su Supabase,
// che non passa dalle server action e quindi non chiama mai revalidatePath).
// Uso: /api/revalidate?secret=<ADMIN_EMAIL>&path=/eventi/slug-evento
// Il parametro path può essere ripetuto per invalidare più pagine insieme.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const adminEmail = process.env.ADMIN_EMAIL

  if (!adminEmail || secret !== adminEmail) {
    return NextResponse.json({ ok: false, errore: 'Non autorizzato.' }, { status: 401 })
  }

  const paths = searchParams.getAll('path')
  if (paths.length === 0) {
    return NextResponse.json({ ok: false, errore: 'Nessun parametro "path" fornito.' }, { status: 400 })
  }

  for (const p of paths) {
    if (!p.startsWith('/')) continue
    revalidatePath(p)
  }

  return NextResponse.json({ ok: true, revalidati: paths })
}
