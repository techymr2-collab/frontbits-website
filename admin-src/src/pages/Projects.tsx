import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Button,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Th,
  Td,
} from '@/components/ui'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { useProjects, useCreateProject } from '@/hooks/useProjects'
import { useClients } from '@/hooks/useClients'
import { emptyToNull } from '@/lib/utils'
import { formatDate, formatMoney } from '@/lib/format'
import { PROJECT_STATUSES, PROJECT_STATUS_TONE } from '@/lib/constants'
import type { ProjectFormValues } from '@/lib/schemas/project'
import type { Project, ProjectStatus } from '@/types/database'

type SortKey = 'name' | 'status' | 'budget' | 'target_delivery_date' | 'created_at'

function toProjectPayload(values: ProjectFormValues) {
  const cleaned = emptyToNull(values)
  return { ...cleaned, budget: Number(cleaned.budget) }
}

export default function Projects() {
  const { data: projects, isLoading, isError, refetch } = useProjects()
  const { data: clients } = useClients()
  const createProject = useCreateProject()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [modalOpen, setModalOpen] = useState(false)

  const clientName = useMemo(() => {
    const map = new Map<string, string>()
    clients?.forEach((c) => map.set(c.id, c.company_name))
    return map
  }, [clients])

  const filtered = useMemo(() => {
    if (!projects) return []
    let rows = projects
    if (statusFilter !== 'all') rows = rows.filter((p) => p.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (clientName.get(p.client_id) ?? '').toLowerCase().includes(q),
      )
    }
    return [...rows].sort((a, b) => {
      if (sortKey === 'budget') {
        const cmp = a.budget - b.budget
        return sortDir === 'asc' ? cmp : -cmp
      }
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [projects, search, statusFilter, sortKey, sortDir, clientName])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  async function handleCreate(values: ProjectFormValues) {
    const created = await createProject.mutateAsync(toProjectPayload(values))
    setModalOpen(false)
    navigate(`/projects/${created.id}`)
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Every engagement in flight, with budget and delivery in view."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Add project
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by project or client"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | ProjectStatus)}
          className="w-44"
        >
          <option value="all">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="We could not load your projects." onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={projects && projects.length > 0 ? 'No projects match your filters' : 'No projects yet'}
            description={
              projects && projects.length > 0
                ? 'Try a different search term or status filter.'
                : 'Add your first project to start tracking tasks and budget.'
            }
            action={
              !projects || projects.length === 0 ? (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  Add project
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHead>
                <tr>
                  <Th sortable active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')}>
                    Project
                  </Th>
                  <Th>Client</Th>
                  <Th sortable active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')}>
                    Status
                  </Th>
                  <Th sortable active={sortKey === 'budget'} dir={sortDir} onClick={() => toggleSort('budget')}>
                    Budget
                  </Th>
                  <Th
                    sortable
                    active={sortKey === 'target_delivery_date'}
                    dir={sortDir}
                    onClick={() => toggleSort('target_delivery_date')}
                  >
                    Target delivery
                  </Th>
                </tr>
              </TableHead>
              <TableBody>
                {filtered.map((project: Project) => (
                  <TableRow key={project.id} onClick={() => navigate(`/projects/${project.id}`)}>
                    <Td className="font-medium">{project.name}</Td>
                    <Td className="text-ink-soft">{clientName.get(project.client_id) ?? 'Unknown'}</Td>
                    <Td>
                      <Badge tone={PROJECT_STATUS_TONE[project.status]}>{project.status}</Badge>
                    </Td>
                    <Td className="text-ink-soft">{formatMoney(project.budget, project.currency)}</Td>
                    <Td className="text-ink-mute">
                      {project.target_delivery_date ? formatDate(project.target_delivery_date) : '—'}
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ProjectFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={createProject.isPending}
      />
    </>
  )
}
