import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Field, Textarea } from '@/components/ui'

export function LostReasonModal({
  open,
  onClose,
  onSubmit,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  submitting?: boolean
}) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!reason.trim()) {
      setError('Enter a reason for losing this lead')
      return
    }
    setError(null)
    onSubmit(reason.trim())
  }

  return (
    <Modal open={open} onClose={onClose} title="Why was this lead lost?" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Reason" error={error ?? undefined}>
          <Textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Went with a competitor, budget cut, no response"
            autoFocus
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={submitting}>
            Mark as lost
          </Button>
        </div>
      </form>
    </Modal>
  )
}
