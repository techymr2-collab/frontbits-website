import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  CalendarClock,
  Newspaper,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Leads', to: '/leads', icon: Briefcase },
  { label: 'Bookings', to: '/bookings', icon: CalendarClock },
  { label: 'Clients', to: '/clients', icon: Users },
  { label: 'Projects', to: '/projects', icon: FolderKanban },
  { label: 'Blog', to: '/blog', icon: Newspaper },
  { label: 'Settings', to: '/settings', icon: Settings },
]
