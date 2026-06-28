import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, FolderKanban, Newspaper, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Card, CardBody, CardHeader, EmptyState, Skeleton, StatCard } from '@/components/ui'
import { useLeads } from '@/hooks/useLeads'
import { useProjects } from '@/hooks/useProjects'
import { useClients } from '@/hooks/useClients'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { useBookings } from '@/hooks/useBookings'
import { useBlogPosts } from '@/hooks/useBlogPosts'
import { formatDate, formatDateTime, formatMoney } from '@/lib/format'
import { LEAD_STATUS_TONE, PROJECT_STATUSES, PROJECT_STATUS_TONE } from '@/lib/constants'
import type { LeadStatus, ProjectStatus } from '@/types/database'

const PIPELINE_STAGES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal']
const STAGE_COLORS: Record<string, string> = {
  New: '#8ec5ff',
  Contacted: '#59a4ff',
  Qualified: '#0071e3',
  Proposal: '#0052a8',
}
const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = ['Discovery', 'In Progress', 'Review']
const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  Discovery: '#8ec5ff',
  'In Progress': '#0071e3',
  Review: '#f59e0b',
  Delivered: '#16a34a',
  'On Hold': '#ef4444',
}

export default function Dashboard() {
  const { data: leads, isLoading: leadsLoading } = useLeads()
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const { data: clients } = useClients()
  const { data: settings } = useCompanySettings()
  const { data: bookings, isLoading: bookingsLoading } = useBookings()
  const { data: blogPosts, isLoading: blogLoading } = useBlogPosts()

  const baseCurrency = settings?.default_currency ?? 'AED'
  const loading = leadsLoading || projectsLoading

  const upcomingBookings = useMemo(
    () =>
      (bookings ?? [])
        .filter((b) => b.status === 'confirmed' && new Date(b.start_time).getTime() > Date.now())
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [bookings],
  )

  const publishedPosts = (blogPosts ?? []).filter((p) => p.status === 'published').length

  const clientName = useMemo(() => {
    const map = new Map<string, string>()
    clients?.forEach((c) => map.set(c.id, c.company_name))
    return map
  }, [clients])

  const openLeads = useMemo(
    () => (leads ?? []).filter((l) => l.status !== 'Won' && l.status !== 'Lost'),
    [leads],
  )

  const pipelineValue = openLeads
    .filter((l) => l.currency === baseCurrency)
    .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0)

  const activeProjects = useMemo(
    () => (projects ?? []).filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status)),
    [projects],
  )

  const wonLeads = (leads ?? []).filter((l) => l.status === 'Won').length

  const pipelineByStage = useMemo(
    () =>
      PIPELINE_STAGES.map((stage) => ({
        stage,
        value: openLeads
          .filter((l) => l.status === stage && l.currency === baseCurrency)
          .reduce((sum, l) => sum + (l.estimated_value ?? 0), 0),
      })),
    [openLeads, baseCurrency],
  )

  const projectsByStatus = useMemo(
    () =>
      PROJECT_STATUSES.map((status) => ({
        status,
        count: (projects ?? []).filter((p) => p.status === status).length,
      })),
    [projects],
  )
  const hasProjects = (projects?.length ?? 0) > 0

  const upcomingFollowUps = useMemo(
    () =>
      openLeads
        .filter((l) => l.next_follow_up_date)
        .sort(
          (a, b) =>
            new Date(a.next_follow_up_date as string).getTime() -
            new Date(b.next_follow_up_date as string).getTime(),
        )
        .slice(0, 5),
    [openLeads],
  )

  const activeProjectsList = useMemo(
    () =>
      [...activeProjects]
        .sort((a, b) => {
          const aDate = a.target_delivery_date ? new Date(a.target_delivery_date).getTime() : Infinity
          const bDate = b.target_delivery_date ? new Date(b.target_delivery_date).getTime() : Infinity
          return aDate - bDate
        })
        .slice(0, 5),
    [activeProjects],
  )

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live overview of leads, pipeline, and projects."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[88px] w-full" />)
        ) : (
          <>
            <StatCard
              label="Pipeline value"
              value={formatMoney(pipelineValue, baseCurrency)}
              hint={`${openLeads.length} open lead${openLeads.length === 1 ? '' : 's'}`}
            />
            <StatCard
              label="Active projects"
              value={activeProjects.length}
              hint={`${projects?.length ?? 0} total projects`}
            />
            <StatCard
              label="Clients"
              value={clients?.length ?? 0}
              hint={`${(clients ?? []).filter((c) => c.status === 'Active').length} active`}
            />
            <StatCard
              label="Leads won"
              value={wonLeads}
              tone={wonLeads > 0 ? 'green' : 'neutral'}
              hint={`${leads?.length ?? 0} total leads`}
            />
          </>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Projects by status" description="All projects, current count" />
          <CardBody>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : !hasProjects ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Create projects to see them broken down by status."
              />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={projectsByStatus} margin={{ left: -16 }}>
                  <CartesianGrid vertical={false} stroke="#e8eaed" />
                  <XAxis
                    dataKey="status"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: '#f7f8fa' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {projectsByStatus.map((entry) => (
                      <Cell key={entry.status} fill={PROJECT_STATUS_COLORS[entry.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Pipeline by stage" description={`Open leads, ${baseCurrency}`} />
          <CardBody>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : pipelineValue === 0 ? (
              <EmptyState
                icon={TrendingUp}
                title="No open pipeline"
                description="Add leads to see your pipeline by stage."
              />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={pipelineByStage} layout="vertical" margin={{ left: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => formatMoney(Number(value), baseCurrency)}
                    cursor={{ fill: '#f7f8fa' }}
                  />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={24}>
                    {pipelineByStage.map((entry) => (
                      <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {bookingsLoading || blogLoading ? (
          <>
            <Skeleton className="h-[88px] w-full" />
            <Skeleton className="h-[88px] w-full" />
          </>
        ) : (
          <>
            <StatCard
              label="Upcoming bookings"
              value={upcomingBookings.length}
              hint={`${bookings?.length ?? 0} total synced from Cal.com`}
            />
            <StatCard
              label="Published posts"
              value={publishedPosts}
              hint={`${blogPosts?.length ?? 0} total in the blog`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming bookings" description="Confirmed calls from Cal.com" />
          <CardBody className="p-0">
            {bookingsLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming bookings"
                description="Confirmed Cal.com bookings will show up here automatically."
              />
            ) : (
              <ul className="divide-y divide-line">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{booking.attendee_name}</p>
                      <p className="truncate text-xs text-ink-mute">{booking.attendee_email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-ink-mute">
                      {formatDateTime(booking.start_time)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Recent posts" description="Latest blog drafts and publishes" />
          <CardBody className="p-0">
            {blogLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !blogPosts || blogPosts.length === 0 ? (
              <EmptyState
                icon={Newspaper}
                title="No posts yet"
                description="Posts you write will show up here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {blogPosts.slice(0, 5).map((post) => (
                  <li key={post.id}>
                    <Link
                      to={`/blog/${post.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-muted"
                    >
                      <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                      <Badge tone={post.status === 'published' ? 'green' : 'slate'}>{post.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming follow-ups" description="Open leads with a scheduled follow-up" />
          <CardBody className="p-0">
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : upcomingFollowUps.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming follow-ups"
                description="Leads with a scheduled follow-up date will show up here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {upcomingFollowUps.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={`/leads/${lead.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
                        <p className="truncate text-xs text-ink-mute">{lead.company || 'No company'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <Badge tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</Badge>
                        <span className="text-xs text-ink-mute">
                          {formatDate(lead.next_follow_up_date)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Active projects" description="Discovery, in progress, and review" />
          <CardBody className="p-0">
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : activeProjectsList.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No active projects"
                description="Projects in discovery, progress, or review will show up here."
              />
            ) : (
              <ul className="divide-y divide-line">
                {activeProjectsList.map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`/projects/${project.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{project.name}</p>
                        <p className="truncate text-xs text-ink-mute">
                          {clientName.get(project.client_id) ?? 'Unknown client'}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-right">
                        {project.target_delivery_date && (
                          <span className="text-xs text-ink-mute">
                            Due {formatDate(project.target_delivery_date)}
                          </span>
                        )}
                        <Badge tone={PROJECT_STATUS_TONE[project.status]}>{project.status}</Badge>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
