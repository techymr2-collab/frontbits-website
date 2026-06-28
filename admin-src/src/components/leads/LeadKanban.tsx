import { useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { Badge } from '@/components/ui'
import { useUpdateLeadStatus } from '@/hooks/useLeads'
import { LostReasonModal } from './LostReasonModal'
import { LEAD_STATUSES, LEAD_STATUS_TONE } from '@/lib/constants'
import { formatDate, formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Lead, LeadStatus } from '@/types/database'

const LEAD_DRAG_TYPE = 'application/x-lead-id'

function LeadCard({ lead, onOpen }: { lead: Lead; onOpen: () => void }) {
  const isOverdue =
    Boolean(lead.next_follow_up_date) && new Date(lead.next_follow_up_date as string) < new Date(new Date().toDateString())

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData(LEAD_DRAG_TYPE, lead.id)}
      onClick={onOpen}
      className="cursor-pointer rounded-xl border border-line bg-surface p-3 shadow-sm transition-colors hover:border-line-strong"
    >
      <p className="text-sm font-medium text-ink">{lead.name}</p>
      {lead.company && <p className="mt-0.5 text-xs text-ink-mute">{lead.company}</p>}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-soft">
          {lead.estimated_value != null ? formatMoney(lead.estimated_value, lead.currency) : ''}
        </span>
        {lead.next_follow_up_date && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-600' : 'text-ink-mute',
            )}
          >
            <Calendar className="size-3" />
            {formatDate(lead.next_follow_up_date)}
          </span>
        )}
      </div>
    </div>
  )
}

export function LeadKanban({ leads }: { leads: Lead[] }) {
  const navigate = useNavigate()
  const updateStatus = useUpdateLeadStatus()
  const [lostPrompt, setLostPrompt] = useState<{ leadId: string } | null>(null)

  function handleDrop(e: DragEvent<HTMLDivElement>, status: LeadStatus) {
    e.preventDefault()
    const id = e.dataTransfer.getData(LEAD_DRAG_TYPE)
    if (!id) return
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.status === status) return
    if (status === 'Lost') {
      setLostPrompt({ leadId: id })
      return
    }
    updateStatus.mutate({ id, status })
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {LEAD_STATUSES.map((status) => {
        const columnLeads = leads.filter((lead) => lead.status === status)
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/60 p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <Badge tone={LEAD_STATUS_TONE[status]}>{status}</Badge>
              <span className="text-xs text-ink-mute">{columnLeads.length}</span>
            </div>
            <div className="flex min-h-12 flex-col gap-2">
              {columnLeads.length === 0 ? (
                <p className="px-1 text-xs text-ink-mute">No leads here</p>
              ) : (
                columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={() => navigate(`/leads/${lead.id}`)} />
                ))
              )}
            </div>
          </div>
        )
      })}

      <LostReasonModal
        key={lostPrompt?.leadId ?? 'closed'}
        open={Boolean(lostPrompt)}
        onClose={() => setLostPrompt(null)}
        submitting={updateStatus.isPending}
        onSubmit={(reason) => {
          if (lostPrompt) {
            updateStatus.mutate({ id: lostPrompt.leadId, status: 'Lost', lost_reason: reason })
          }
          setLostPrompt(null)
        }}
      />
    </div>
  )
}
