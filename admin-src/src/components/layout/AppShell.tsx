import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAuth } from '@/context/AuthContext'

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { previewMode } = useAuth()

  return (
    <div className="flex h-svh overflow-hidden bg-canvas print:h-auto print:overflow-visible">
      {/* Desktop sidebar */}
      <div className="hidden shrink-0 print:hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 print:hidden md:hidden">
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-2 text-ink-soft hover:bg-muted"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Topbar onMenuClick={() => setDrawerOpen(true)} />
        </div>

        {previewMode && (
          <div className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-800 print:hidden md:px-6">
            Preview mode. Supabase is not configured, so data is not saved. Add your
            Supabase keys to .env to enable real auth and storage.
          </div>
        )}

        <main className="flex-1 overflow-y-auto print:overflow-visible">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
