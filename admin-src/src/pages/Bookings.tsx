import { useMemo, useState } from 'react'
import { CalendarClock, Search, StickyNote } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Th,
  Td,
} from '@/components/ui'
import { BookingNotesModal } from '@/components/bookings/BookingNotesModal'
import { useBookings, useUpdateBooking } from '@/hooks/useBookings'
import { formatDateTime } from '@/lib/format'
import { BOOKING_STATUSES, BOOKING_STATUS_TONE } from '@/lib/constants'
import type { Booking, BookingStatus } from '@/types/database'

export default function Bookings() {
  const { data: bookings, isLoading, isError, refetch } = useBookings()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all')
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null)

  const updateBooking = useUpdateBooking(activeBooking?.id ?? '')

  const filtered = useMemo(() => {
    if (!bookings) return []
    let rows = bookings
    if (statusFilter !== 'all') rows = rows.filter((b) => b.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (q) {
      rows = rows.filter(
        (b) =>
          b.attendee_name.toLowerCase().includes(q) ||
          b.attendee_email.toLowerCase().includes(q),
      )
    }
    return rows
  }, [bookings, search, statusFilter])

  async function handleSaveNotes(values: { internal_notes: string | null; lead_id: string | null }) {
    await updateBooking.mutateAsync(values)
    setActiveBooking(null)
  }

  return (
    <>
      <PageHeader
        title="Bookings"
        description="Calls booked through Cal.com. Synced automatically -- times and attendee details aren't editable here."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BookingStatus)}
          className="w-40"
        >
          <option value="all">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Card className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </Card>
      ) : isError ? (
        <Card>
          <ErrorState message="We could not load bookings." onRetry={refetch} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title={bookings && bookings.length > 0 ? 'No bookings match your search' : 'No bookings yet'}
            description={
              bookings && bookings.length > 0
                ? 'Try a different search term.'
                : "Bookings made through Cal.com will show up here automatically once it's connected."
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHead>
                <tr>
                  <Th>Attendee</Th>
                  <Th>When</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                  <Th>{null}</Th>
                </tr>
              </TableHead>
              <TableBody>
                {filtered.map((booking) => (
                  <TableRow key={booking.id}>
                    <Td className="font-medium">
                      {booking.attendee_name}
                      <div className="text-xs font-normal text-ink-mute">{booking.attendee_email}</div>
                    </Td>
                    <Td className="text-ink-soft">{formatDateTime(booking.start_time)}</Td>
                    <Td>
                      <Badge tone={BOOKING_STATUS_TONE[booking.status]}>{booking.status}</Badge>
                    </Td>
                    <Td className="max-w-xs truncate text-ink-mute">{booking.internal_notes || '—'}</Td>
                    <Td>
                      <button
                        type="button"
                        onClick={() => setActiveBooking(booking)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <StickyNote className="size-3.5" />
                        Edit notes
                      </button>
                    </Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <BookingNotesModal
        open={Boolean(activeBooking)}
        onClose={() => setActiveBooking(null)}
        onSubmit={handleSaveNotes}
        booking={activeBooking}
        submitting={updateBooking.isPending}
      />
    </>
  )
}
