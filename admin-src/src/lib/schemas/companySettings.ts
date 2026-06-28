import { z } from 'zod'

export const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Enter a company name'),
  address: z.string().optional().or(z.literal('')),
  trn: z.string().optional().or(z.literal('')),
  default_currency: z.enum(['AED', 'USD']),
})

export type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>
