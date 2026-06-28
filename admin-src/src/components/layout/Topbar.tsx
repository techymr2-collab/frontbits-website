import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Menu, Search, Briefcase, Building2, UserRound } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useClients } from '@/hooks/useClients'
import { useLeads } from '@/hooks/useLeads'
import { useProjects } from '@/hooks/useProjects'
import { Avatar } from '@/components/ui'
import { Input } from '@/components/ui'

const MAX_RESULTS_PER_GROUP = 5

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: clients } = useClients()
  const { data: leads } = useLeads()
  const { data: projects } = useProjects()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { clients: [], leads: [], projects: [] }

    return {
      clients: (clients ?? [])
        .filter(
          (c) =>
            c.company_name.toLowerCase().includes(q) ||
            c.primary_contact_name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q),
        )
        .slice(0, MAX_RESULTS_PER_GROUP),
      leads: (leads ?? [])
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.company?.toLowerCase().includes(q) ||
            l.email?.toLowerCase().includes(q),
        )
        .slice(0, MAX_RESULTS_PER_GROUP),
      projects: (projects ?? [])
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, MAX_RESULTS_PER_GROUP),
    }
  }, [query, clients, leads, projects])

  const hasResults = results.clients.length + results.leads.length + results.projects.length > 0

  function goTo(path: string) {
    navigate(path)
    setQuery('')
    setSearchOpen(false)
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur md:px-6">
      <button
        onClick={onMenuClick}
        className="-ml-1 rounded-lg p-2 text-ink-soft hover:bg-muted md:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative w-full max-w-md" ref={searchRef}>
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search leads, clients, projects"
          aria-label="Global search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
        />

        {searchOpen && query.trim() && (
          <div className="absolute left-0 top-full mt-2 w-full overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]">
            {!hasResults ? (
              <p className="px-4 py-3 text-sm text-ink-mute">No matches for &ldquo;{query.trim()}&rdquo;</p>
            ) : (
              <div className="max-h-96 overflow-y-auto py-1">
                {results.clients.length > 0 && (
                  <SearchGroup label="Clients">
                    {results.clients.map((c) => (
                      <SearchResult
                        key={c.id}
                        icon={<Building2 className="size-4" />}
                        title={c.company_name}
                        subtitle={c.primary_contact_name ?? c.email ?? undefined}
                        onClick={() => goTo(`/clients/${c.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {results.leads.length > 0 && (
                  <SearchGroup label="Leads">
                    {results.leads.map((l) => (
                      <SearchResult
                        key={l.id}
                        icon={<UserRound className="size-4" />}
                        title={l.name}
                        subtitle={l.company ?? l.email ?? undefined}
                        onClick={() => goTo(`/leads/${l.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
                {results.projects.length > 0 && (
                  <SearchGroup label="Projects">
                    {results.projects.map((p) => (
                      <SearchResult
                        key={p.id}
                        icon={<Briefcase className="size-4" />}
                        title={p.name}
                        onClick={() => goTo(`/projects/${p.id}`)}
                      />
                    ))}
                  </SearchGroup>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative ml-auto" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 hover:bg-muted"
        >
          <Avatar name={user?.name} className="size-8" />
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-ink">
              {user?.name}
            </span>
            <span className="block text-xs leading-tight text-ink-mute">
              {user?.email}
            </span>
          </span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-pop)]">
            <div className="border-b border-line px-4 py-3">
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-ink-mute">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                setMenuOpen(false)
                void signOut()
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-muted"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function SearchGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-4 pt-2 text-xs font-medium uppercase tracking-wide text-ink-mute">{label}</p>
      <div className="pb-1">{children}</div>
    </div>
  )
}

function SearchResult({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2 text-left hover:bg-muted"
    >
      <span className="text-ink-mute">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-ink">{title}</span>
        {subtitle && <span className="block truncate text-xs text-ink-mute">{subtitle}</span>}
      </span>
    </button>
  )
}
