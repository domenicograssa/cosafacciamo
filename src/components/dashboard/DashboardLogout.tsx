'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
    >
      Esci
    </button>
  )
}
