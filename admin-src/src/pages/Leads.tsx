import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus, Search, Table2, Target } from 'lucide-react'
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
import { LeadFormModal } from '@/components/leads/LeadFormModal'
import { LeadKanban } from '@/components/leads/LeadKanban'
import { useLeads, useCreateLead } from '@/hooks/useLeads'
import { emptyToNull, cn } from '@/lib/utils'
import { formatDate, formatMoney } from '@/lib/format'
import { LEAD_STATUSES, LEAD_STATUS_TONE } from '@/lib/constants'
import type { LeadFormValues } from '@/lib/schemas/lead'
import type { Lead, LeadStatus } from '@/types/database'

type SortKey = 'name' | 'company' | 'status' | 'estimated_value' | 'next_follow_up_date' | 'created_at'

function toLeadPayload(values: LeadFormValues) {
  const cleaned = emptyToNull(values)
  return {
    ...cleaned,
    estimated_value: cleaned.estimated_value ? Number(cleaned.estimated_value) : null,
  }
}

export default function Leads() {
  const { data: leads, isLoading, isError, refetch } = useLeads()
  const createLead = useCreateLead()
  const navigate = useNavigate()

  const [view, setView] = useState<'kanban' | 'table'>('kanban')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!leads) return []
    const q = search.trim().toLowerCase()
    if (!q) return leads
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.company ?? '').toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q),
    )
  }, [leads, search])

  const tableRows = useMemo(() => {
    let rows = filtered
    if (statusFilter !== 'all') rows = rows.filter((l) => l.status === statusFilter)
    return [...rows].sort((a, b) => {
      if (sortKey === 'estimated_value') {
        const cmp = (a.estimated_value ?? 0) - (b.estimated_value ?? 0)
        return sortDir === 'asc' ? cmp : -cmp
      }
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  async function handleCreate(values: LeadFormValues) {
    const created = await createLead.mutateAsync(toLeadPayload(values))
    setModalOpen(false)
    navigate(`/leads/${created.id}`)
  }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Track every opportunity from first contact to signed deal."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Add lead
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by name, company, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex items-center gap-3">
          {view === 'table' && (
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | LeadStatus)}
              className="w-40"
            >
              <option value="all">All statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          )}
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setView('kanban')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                view === 'kanban' ? 'bg-white text-ink shadow-sm' : 'text-ink-mute hover:text-ink',
              )}
            >
              <LayoutGrid className="size-3.5" />
              Kanban
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                view === 'table' ? 'bg-white text-ink shadow-sm' : 'text-ink-mute hover:text-ink',
              )}
            >
              <Table2 className="size-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : isError ? (
        <Card>
          <ErrorState message="We could not load your leads." onRetry={refetch} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Target}
            title={leads && leads.length > 0 ? 'No leads match your search' : 'No leads yet'}
            description={
              leads && leads.length > 0
                ? 'Try a different search term.'
                : 'Add your first lead to start tracking the pipeline.'
            }
            action={
              !leads || leads.length === 0 ? (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  Add lead
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : view === 'kanban' ? (
        <LeadKanban leads={filtered} />
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHead>
                <tr>
                  <Th sortable active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')}>
                    Name
                  </Th>
                  <Th sortable active={sortKey === 'company'} dir={sortDir} onClick={() => toggleSort('company')}>
                    Company
                  </Th>
                  <Th sortable active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')}>
                    Status
                  </Th>
                  <Th
                    sortable
                    active={sortKey === 'estimated_value'}
                    dir={sortDir}
                    onClick={() => toggleSort('estimated_value')}
                  >
                    Estimated value
                  </Th>
                  <Th
                    sortable
                    active={sortKey === 'next_follow_up_date'}
                    dir={sortDir}
                    onClick={() => toggleSort('next_follow_up_date')}
                  >
                    Next follow up
                  </Th>
                  <Th sortable active={sortKey === 'created_at'} dir={sortDir} onClick={() => toggleSort('created_at')}>
                    Added
                  </Th>
                </tr>
              </TableHead>
              <TableBody>
                {tableRows.map((lead: Lead) => (
                  <TableRow key={lead.id} onClick={() => navigate(`/leads/${lead.id}`)}>
                    <Td className="font-medium">{lead.name}</Td>
                    <Td className="text-ink-soft">{lead.company || '—'}</Td>
                    <Td>
                      <Badge tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</Badge>
                    </Td>
                    <Td className="text-ink-soft">
                      {lead.estimated_value != null ? formatMoney(lead.estimated_value, lead.currency) : '—'}
                    </Td>
                    <Td className="text-ink-mute">
                      {lead.next_follow_up_date ? formatDate(lead.next_follow_up_date) : '—'}
                    </Td>
                    <Td className="text-ink-mute">{formatDate(lead.created_at)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <LeadFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={createLead.isPending}
      />
    </>
  )
}
