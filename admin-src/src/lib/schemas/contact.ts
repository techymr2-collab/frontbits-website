import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().min(1, 'Enter a name'),
  role: z.string().optional().or(z.literal('')),
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  is_primary: z.boolean(),
})

export type ContactFormValues = z.infer<typeof contactSchema>
