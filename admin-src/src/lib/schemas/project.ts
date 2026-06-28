import { z } from 'zod'

export const projectSchema = z.object({
  client_id: z.string().min(1, 'Choose a client'),
  name: z.string().min(1, 'Enter a project name'),
  description: z.string().optional().or(z.literal('')),
  status: z.enum(['Discovery', 'In Progress', 'Review', 'Delivered', 'On Hold']),
  pricing_tier: z.enum(['Starter', 'Growth', 'Scale', 'Custom']),
  budget: z
    .string()
    .min(1, 'Enter a budget')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid amount'),
  currency: z.enum(['AED', 'USD']),
  start_date: z.string().optional().or(z.literal('')),
  target_delivery_date: z.string().optional().or(z.literal('')),
  owner_id: z.string().optional().or(z.literal('')),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
