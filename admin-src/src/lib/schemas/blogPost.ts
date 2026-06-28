import { z } from 'zod'

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Enter a title'),
  slug: z
    .string()
    .min(1, 'Enter a slug')
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().optional().or(z.literal('')),
  body: z.string().min(1, 'Enter some content'),
  cover_image_url: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'published']),
})

export type BlogPostFormValues = z.infer<typeof blogPostSchema>

/** Turn "My First Post" into "my-first-post". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
