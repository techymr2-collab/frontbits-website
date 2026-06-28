import { useState, type FormEvent } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRightCircle, MessageSquare, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
  Textarea,
} from '@/components/ui'
import { LeadFormModal } from '@/components/leads/LeadFormModal'
import { useLead, useUpdateLead, useDeleteLead, useConvertLead } from '@/hooks/useLeads'
import { useLeadNotes, useCreateLeadNote } from '@/hooks/useLeadNotes'
import { useProfiles } from '@/hooks/useProfiles'
import { useAuth } from '@/context/AuthContext'
import { emptyToNull } from '@/lib/utils'
import { formatDate, formatMoney, formatRelative } from '@/lib/format'
import { LEAD_STATUS_TONE } from '@/lib/constants'
import type { LeadFormValues } from '@/lib/schemas/lead'

function toLeadPayload(values: LeadFormValues) {
  const cleaned = emptyToNull(values)
  return {
    ...cleaned,
    estimated_value: cleaned.estimated_value ? Number(cleaned.estimated_value) : null,
  }
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-medium text-ink-mute">{label}</span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  )
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: lead, isLoading, isError, refetch } = useLead(id)
  const { data: notes, isLoading: notesLoading } = useLeadNotes(id)
  const { data: profiles } = useProfiles()

  const updateLead = useUpdateLead(id ?? '')
  const deleteLead = useDeleteLead()
  const convertLead = useConvertLead()
  const createNote = useCreateLeadNote(id ?? '')

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [confirmConvertOpen, setConfirmConvertOpen] = useState(false)
  const [noteBody, setNoteBody] = useState('')

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !lead) {
    return <ErrorState message="We could not load this lead." onRetry={refetch} />
  }

  function authorName(authorId: string | null) {
    if (!authorId) return 'Unknown'
    return profiles?.find((p) => p.id === authorId)?.full_name ?? 'Unknown'
  }

  async function handleEditSubmit(values: LeadFormValues) {
    await updateLead.mutateAsync(toLeadPayload(values))
    setEditOpen(false)
  }

  async function handleDelete() {
    if (!lead) return
    await deleteLead.mutateAsync(lead.id)
    navigate('/leads')
  }

  async function handleConvert() {
    if (!lead) return
    const client = await convertLead.mutateAsync(lead)
    setConfirmConvertOpen(false)
    navigate(`/clients/${client.id}`)
  }

  async function handleAddNote(e: FormEvent) {
    e.preventDefault()
    const body = noteBody.trim()
    if (!body || !lead) return
    await createNote.mutateAsync({ lead_id: lead.id, author_id: user?.id ?? null, body })
    setNoteBody('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/leads')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to leads
      </button>

      <PageHeader
        title={lead.name}
        description={lead.company || 'No company set'}
        actions={
          <>
            {lead.converted_client_id ? (
              <Button variant="secondary" onClick={() => navigate(`/clients/${lead.converted_client_id}`)}>
                <ArrowRightCircle className="size-4" />
                View client
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setConfirmConvertOpen(true)}>
                <ArrowRightCircle className="size-4" />
                Convert to client
              </Button>
            )}
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Lead details" />
            <CardBody className="divide-y divide-line">
              <DetailRow label="Status" value={<Badge tone={LEAD_STATUS_TONE[lead.status]}>{lead.status}</Badge>} />
              <DetailRow label="Source" value={lead.source.charAt(0).toUpperCase() + lead.source.slice(1)} />
              <DetailRow label="Email" value={lead.email || 'Not set'} />
              <DetailRow label="Phone" value={lead.phone || 'Not set'} />
              {lead.project_type && <DetailRow label="Project type" value={lead.project_type} />}
              {lead.budget_range && <DetailRow label="Budget" value={lead.budget_range} />}
              <DetailRow
                label="Estimated value"
                value={lead.estimated_value != null ? formatMoney(lead.estimated_value, lead.currency) : 'Not set'}
              />
              <DetailRow
                label="Next follow up"
                value={lead.next_follow_up_date ? formatDate(lead.next_follow_up_date) : 'Not set'}
              />
              {lead.status === 'Lost' && (
                <DetailRow label="Lost reason" value={lead.lost_reason || 'Not set'} />
              )}
              <DetailRow label="Notes" value={lead.notes || 'No notes yet'} />
              {lead.converted_client_id && (
                <DetailRow
                  label="Converted"
                  value={
                    <Link to={`/clients/${lead.converted_client_id}`} className="text-brand-600 hover:underline">
                      View client
                    </Link>
                  }
                />
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Notes" description="A timeline of updates on this lead" />
            <CardBody>
              <form onSubmit={handleAddNote} className="mb-4 space-y-2">
                <Textarea
                  rows={2}
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Add a note about this lead"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" loading={createNote.isPending} disabled={!noteBody.trim()}>
                    Add note
                  </Button>
                </div>
              </form>

              {notesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : !notes || notes.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No notes yet"
                  description="Notes you add will show up here in a timeline."
                />
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => (
                    <li key={note.id} className="flex items-start gap-3">
                      <Avatar name={authorName(note.author_id)} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{authorName(note.author_id)}</span>
                          <span className="text-xs text-ink-mute">{formatRelative(note.created_at)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{note.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <LeadFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        lead={lead}
        submitting={updateLead.isPending}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this lead?"
        description="This permanently deletes the lead and its notes. This cannot be undone."
        loading={deleteLead.isPending}
      />

      <ConfirmDialog
        open={confirmConvertOpen}
        onClose={() => setConfirmConvertOpen(false)}
        onConfirm={handleConvert}
        title="Convert this lead to a client?"
        description="This creates a new client record from this lead's details and marks the lead as won."
        confirmLabel="Convert to client"
        confirmVariant="primary"
        loading={convertLead.isPending}
      />
    </>
  )
}
