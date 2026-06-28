import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Th,
  Td,
} from '@/components/ui'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { useClients, useCreateClient } from '@/hooks/useClients'
import { emptyToNull, cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { ClientFormValues } from '@/lib/schemas/client'
import type { Client, ClientStatus } from '@/types/database'

type SortKey = 'company_name' | 'country' | 'status' | 'created_at'

const STATUS_TABS: Array<{ label: string; value: 'all' | ClientStatus }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
]

export default function Clients() {
  const { data: clients, isLoading, isError, refetch } = useClients()
  const createClient = useCreateClient()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | ClientStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('company_name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!clients) return []
    let rows = clients
    if (statusFilter !== 'all') {
      rows = rows.filter((c) => c.status === statusFilter)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (c) =>
          c.company_name.toLowerCase().includes(q) ||
          (c.primary_contact_name ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q),
      )
    }
    return [...rows].sort((a, b) => {
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      const cmp = av.localeCompare(bv)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [clients, search, statusFilter, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  async function handleCreate(values: ClientFormValues) {
    const created = await createClient.mutateAsync(emptyToNull(values))
    setModalOpen(false)
    navigate(`/clients/${created.id}`)
  }

  return (
    <>
      <PageHeader
        title="Clients"
        description="Every company you bill, in one searchable list."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Add client
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by company, contact, or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === tab.value
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-mute hover:text-ink',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState message="We could not load your clients." onRetry={refetch} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={clients && clients.length > 0 ? 'No clients match your filters' : 'No clients yet'}
            description={
              clients && clients.length > 0
                ? 'Try a different search term or status filter.'
                : 'Add your first client to start tracking contacts and projects.'
            }
            action={
              !clients || clients.length === 0 ? (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  Add client
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHead>
                <tr>
                  <Th sortable active={sortKey === 'company_name'} dir={sortDir} onClick={() => toggleSort('company_name')}>
                    Company
                  </Th>
                  <Th>Primary contact</Th>
                  <Th sortable active={sortKey === 'country'} dir={sortDir} onClick={() => toggleSort('country')}>
                    Country
                  </Th>
                  <Th sortable active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')}>
                    Status
                  </Th>
                  <Th sortable active={sortKey === 'created_at'} dir={sortDir} onClick={() => toggleSort('created_at')}>
                    Added
                  </Th>
                </tr>
              </TableHead>
              <TableBody>
                {filtered.map((client: Client) => (
                  <TableRow key={client.id} onClick={() => navigate(`/clients/${client.id}`)}>
                    <Td className="font-medium">{client.company_name}</Td>
                    <Td className="text-ink-soft">{client.primary_contact_name || '—'}</Td>
                    <Td className="text-ink-soft">{client.country}</Td>
                    <Td>
                      <Badge tone={client.status === 'Active' ? 'green' : 'slate'}>{client.status}</Badge>
                    </Td>
                    <Td className="text-ink-mute">{formatDate(client.created_at)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={createClient.isPending}
      />
    </>
  )
}
