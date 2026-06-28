import { z } from 'zod'

export const clientSchema = z.object({
  company_name: z.string().min(1, 'Enter a company name'),
  primary_contact_name: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  country: z.enum(['UAE', 'UK', 'US', 'Canada', 'other']),
  city: z.string().optional().or(z.literal('')),
  trn: z.string().optional().or(z.literal('')),
  billing_currency: z.enum(['AED', 'USD']),
  billing_address: z.string().optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']),
  notes: z.string().optional().or(z.literal('')),
})

export type ClientFormValues = z.infer<typeof clientSchema>
