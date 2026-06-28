import { z } from 'zod'

export const leadSchema = z
  .object({
    name: z.string().min(1, 'Enter a name'),
    company: z.string().optional().or(z.literal('')),
    email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    source: z.enum(['referral', 'inbound', 'outbound', 'event', 'website', 'other']),
    status: z.enum(['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']),
    estimated_value: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((v) => !v || !Number.isNaN(Number(v)), 'Enter a valid number'),
    currency: z.enum(['AED', 'USD']),
    next_follow_up_date: z.string().optional().or(z.literal('')),
    notes: z.string().optional().or(z.literal('')),
    lost_reason: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.status !== 'Lost' || Boolean(data.lost_reason?.trim()), {
    message: 'Enter a reason for losing this lead',
    path: ['lost_reason'],
  })

export type LeadFormValues = z.infer<typeof leadSchema>
