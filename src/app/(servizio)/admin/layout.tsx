import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin — moesco',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">
              A
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
