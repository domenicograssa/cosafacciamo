import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import LogoMoesco from '@/components/layout/LogoMoesco'
import DashboardLogout from '@/components/dashboard/DashboardLogout'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'La mia area — moesco',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (!user) {
    redirect('/accedi?redirect=/dashboard')
  }

  // Recupera il profilo organizzatore
  const { data: organizzatore } = await sb
    .from('organizzatori')
    .select('id, nome, stato')
    .eq('auth_user_id', user.id)
    .single()

  if (!organizzatore) {
    // Auth senza profilo organizzatore (es. account admin atterrato qui)
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user!.email === adminEmail) {
      redirect('/admin')
    }
    redirect('/')
  }

  const iniziale = organizzatore.nome.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <LogoMoesco height={28} />
            <span className="text-xs text-gray-400 hidden sm:block">Area organizzatore</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600 text-sm">
                {iniziale}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[140px] truncate">
                {organizzatore.nome}
              </span>
            </div>
            {organizzatore.stato === 'in_attesa' && (
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                In approvazione
              </span>
            )}
            <DashboardLogout />
          </div>
        </div>
      </header>

      {/* Nav secondaria */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 text-sm font-medium overflow-x-auto">
          <Link href="/dashboard" className="py-3 border-b-2 border-transparent hover:border-amber-400 hover:text-amber-700 text-gray-600 transition-colors whitespace-nowrap">
            Dashboard
          </Link>
          <Link href="/dashboard/miei-eventi" className="py-3 border-b-2 border-transparent hover:border-amber-400 hover:text-amber-700 text-gray-600 transition-colors whitespace-nowrap">
            I miei eventi
          </Link>
          <Link href="/pubblica" className="py-3 border-b-2 border-transparent hover:border-amber-400 hover:text-amber-700 text-gray-600 transition-colors whitespace-nowrap">
            + Pubblica evento
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
