import { notFound, redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import FormModificaEvento from '@/components/admin/FormModificaEvento'

export default async function ModificaEventoPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const sb = await createAdminClient()

  const { data: evento } = await sb
    .from('eventi')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (!evento) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <a href="/admin" className="hover:text-amber-600">Dashboard</a>
        <span>›</span>
        <a href="/admin/eventi" className="hover:text-amber-600">Eventi</a>
        <span>›</span>
        <a href={`/admin/eventi/${slug}`} className="hover:text-amber-600 truncate max-w-[180px]">{evento.titolo}</a>
        <span>›</span>
        <span className="text-gray-900 font-medium">Modifica</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-extrabold text-gray-900 mb-6">Modifica evento</h1>
        <FormModificaEvento evento={evento} slugEvento={slug} />
      </div>
    </div>
  )
}
