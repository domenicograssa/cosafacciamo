import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import FormModificaEventoDashboard from '@/components/dashboard/FormModificaEventoDashboard'

export default async function ModificaEventoDashboard({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) redirect('/accedi?redirect=/dashboard/miei-eventi')

  const { data: organizzatore } = await sb
    .from('organizzatori')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!organizzatore) redirect('/dashboard')

  const sbAdmin = await createAdminClient()

  const [{ data: evento }, { data: comuniRaw }, { data: categorieRaw }, { data: catEvento }] = await Promise.all([
    sbAdmin.from('eventi').select('*').eq('slug', slug).eq('organizzatore_id', organizzatore.id).maybeSingle(),
    sbAdmin.from('geo_nodi').select('id, nome').eq('tipo', 'comune').order('nome'),
    sbAdmin.from('categorie').select('id, nome, icona').eq('attiva', true).order('ordinamento'),
    sbAdmin.from('eventi').select('id, eventi_categorie(categoria_id)').eq('slug', slug).maybeSingle(),
  ])

  if (!evento) notFound()

  const comuni = (comuniRaw ?? []) as { id: string; nome: string }[]
  const categorie = (categorieRaw ?? []) as { id: string; nome: string; icona: string | null }[]
  const categorieSelezionate = (
    (catEvento as unknown as { eventi_categorie: { categoria_id: string }[] } | null)
      ?.eventi_categorie ?? []
  ).map((c: { categoria_id: string }) => c.categoria_id)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-amber-600">Dashboard</Link>
        <span>›</span>
        <Link href="/dashboard/miei-eventi" className="hover:text-amber-600">I miei eventi</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium truncate">{evento.titolo}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Modifica evento</h1>
        <FormModificaEventoDashboard
          evento={evento}
          comuni={comuni}
          categorie={categorie}
          categorieSelezionate={categorieSelezionate}
        />
      </div>
    </div>
  )
}
