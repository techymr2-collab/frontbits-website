import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '@/lib/nav'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo.svg'

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-60 flex-col border-r border-line bg-surface">
      <div className="flex h-16 items-center px-5">
        <img src={logo} alt="Frontbits" className="h-6 w-auto" />
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-ink-soft hover:bg-muted hover:text-ink',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('size-[18px]', isActive ? 'text-brand-600' : 'text-ink-mute')}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line px-5 py-4">
        <p className="text-xs font-medium text-ink-soft">Frontbits LLC</p>
        <p className="text-[11px] text-ink-mute">Internal CRM</p>
      </div>
    </aside>
  )
}
