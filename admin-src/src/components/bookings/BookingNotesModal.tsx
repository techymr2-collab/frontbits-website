import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Field, Select, Textarea } from '@/components/ui'
import { useLeads } from '@/hooks/useLeads'
import type { Booking } from '@/types/database'

export function BookingNotesModal({
  open,
  onClose,
  onSubmit,
  booking,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: { internal_notes: string | null; lead_id: string | null }) => void
  booking: Booking | null
  submitting?: boolean
}) {
  const { data: leads } = useLeads()
  const [notes, setNotes] = useState('')
  const [leadId, setLeadId] = useState('')

  useEffect(() => {
    if (!open || !booking) return
    setNotes(booking.internal_notes ?? '')
    setLeadId(booking.lead_id ?? '')
  }, [open, booking])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ internal_notes: notes.trim() || null, lead_id: leadId || null })
  }

  if (!booking) return null

  return (
    <Modal open={open} onClose={onClose} title={`Notes for ${booking.attendee_name}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Linked lead" hint="Match this booking to an existing lead, if any">
          <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
            <option value="">No lead linked</option>
            {leads?.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name}
                {lead.company ? ` — ${lead.company}` : ''}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Internal notes" hint="Only visible here, never synced to Cal.com">
          <Textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the team should know before this call"
          />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  )
}
