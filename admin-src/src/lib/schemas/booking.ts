import { z } from 'zod'

/**
 * Only internal_notes is admin-editable -- everything else on a booking is
 * owned by the Cal.com webhook sync.
 */
export const bookingNotesSchema = z.object({
  internal_notes: z.string().optional().or(z.literal('')),
})

export type BookingNotesValues = z.infer<typeof bookingNotesSchema>
