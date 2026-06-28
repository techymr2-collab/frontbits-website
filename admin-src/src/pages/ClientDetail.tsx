import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  FolderKanban,
  Mail,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
  Users,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
} from '@/components/ui'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { ContactFormModal } from '@/components/clients/ContactFormModal'
import { useClient, useDeleteClient, useUpdateClient } from '@/hooks/useClients'
import {
  useContactsByClient,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from '@/hooks/useContacts'
import { useProjectsByClient } from '@/hooks/useProjectsByClient'
import { emptyToNull } from '@/lib/utils'
import { formatMoney } from '@/lib/format'
import { PROJECT_STATUS_TONE } from '@/lib/constants'
import type { ClientFormValues } from '@/lib/schemas/client'
import type { ContactFormValues } from '@/lib/schemas/contact'
import type { Contact } from '@/types/database'

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-medium text-ink-mute">{label}</span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  )
}

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: client, isLoading, isError, refetch } = useClient(id)
  const { data: contacts, isLoading: contactsLoading } = useContactsByClient(id)
  const { data: projects, isLoading: projectsLoading } = useProjectsByClient(id)

  const updateClient = useUpdateClient(id ?? '')
  const deleteClient = useDeleteClient()
  const createContact = useCreateContact(id ?? '')
  const updateContact = useUpdateContact(id ?? '')
  const deleteContact = useDeleteContact(id ?? '')

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [contactModal, setContactModal] = useState<{ open: boolean; contact?: Contact | null }>({
    open: false,
  })
  const [confirmContactDelete, setConfirmContactDelete] = useState<Contact | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !client) {
    return <ErrorState message="We could not load this client." onRetry={refetch} />
  }

  async function handleEditSubmit(values: ClientFormValues) {
    await updateClient.mutateAsync(emptyToNull(values))
    setEditOpen(false)
  }

  async function handleDelete() {
    if (!client) return
    setDeleteError(null)
    try {
      await deleteClient.mutateAsync(client.id)
      navigate('/clients')
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23503') {
        setDeleteError('This client still has projects. Delete those first.')
      } else {
        setDeleteError('Something went wrong deleting this client.')
      }
    }
  }

  async function handleContactSubmit(values: ContactFormValues) {
    const payload = emptyToNull(values)
    if (contactModal.contact) {
      await updateContact.mutateAsync({ id: contactModal.contact.id, input: payload })
    } else {
      await createContact.mutateAsync({ ...payload, client_id: client!.id })
    }
    setContactModal({ open: false })
  }

  async function handleContactDelete() {
    if (!confirmContactDelete) return
    await deleteContact.mutateAsync(confirmContactDelete.id)
    setConfirmContactDelete(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/clients')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to clients
      </button>

      <PageHeader
        title={client.company_name}
        description={`${client.country}${client.city ? `, ${client.city}` : ''}`}
        actions={
          <>
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
            <CardHeader title="Client details" />
            <CardBody className="divide-y divide-line">
              <DetailRow
                label="Status"
                value={<Badge tone={client.status === 'Active' ? 'green' : 'slate'}>{client.status}</Badge>}
              />
              <DetailRow label="Email" value={client.email || 'Not set'} />
              <DetailRow label="Phone" value={client.phone || 'Not set'} />
              <DetailRow label="TRN" value={client.trn || 'Not set'} />
              <DetailRow label="Billing currency" value={client.billing_currency} />
              <DetailRow label="Billing address" value={client.billing_address || 'Not set'} />
              <DetailRow label="Notes" value={client.notes || 'No notes yet'} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Contacts"
              description={`${contacts?.length ?? 0} people`}
              action={
                <Button size="sm" variant="secondary" onClick={() => setContactModal({ open: true })}>
                  <Plus className="size-4" />
                  Add contact
                </Button>
              }
            />
            <CardBody>
              {contactsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : !contacts || contacts.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No contacts yet"
                  description="Add the people you talk to at this company."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {contacts.map((contact) => (
                    <li key={contact.id} className="flex items-center justify-between gap-4 py-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-ink">{contact.name}</span>
                          {contact.is_primary && (
                            <Badge tone="brand">
                              <Star className="size-3" />
                              Primary
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-mute">
                          {contact.role && <span>{contact.role}</span>}
                          {contact.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="size-3" /> {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3" /> {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setContactModal({ open: true, contact })}
                          className="rounded-lg p-2 text-ink-mute hover:bg-muted hover:text-ink"
                          aria-label="Edit contact"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmContactDelete(contact)}
                          className="rounded-lg p-2 text-ink-mute hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove contact"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Projects" description="Linked work for this client" />
            <CardBody>
              {projectsLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : !projects || projects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  title="No projects yet"
                  description="Projects for this client will show up here once created."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {projects.map((project) => (
                    <li
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="flex cursor-pointer items-center justify-between gap-4 py-3 hover:bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{project.name}</p>
                        <p className="mt-0.5 text-xs text-ink-mute">
                          {project.pricing_tier} · {formatMoney(project.budget, project.currency)}
                        </p>
                      </div>
                      <Badge tone={PROJECT_STATUS_TONE[project.status]}>{project.status}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <ClientFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        client={client}
        submitting={updateClient.isPending}
      />

      <ContactFormModal
        open={contactModal.open}
        onClose={() => setContactModal({ open: false })}
        onSubmit={handleContactSubmit}
        contact={contactModal.contact}
        submitting={createContact.isPending || updateContact.isPending}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false)
          setDeleteError(null)
        }}
        onConfirm={handleDelete}
        title="Delete this client?"
        description={
          deleteError ?? 'This permanently deletes the client and its contacts. This cannot be undone.'
        }
        loading={deleteClient.isPending}
      />

      <ConfirmDialog
        open={Boolean(confirmContactDelete)}
        onClose={() => setConfirmContactDelete(null)}
        onConfirm={handleContactDelete}
        title="Remove this contact?"
        description={confirmContactDelete ? `${confirmContactDelete.name} will be removed from this client.` : undefined}
        loading={deleteContact.isPending}
      />
    </>
  )
}
