import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, Field, Input, Select, Textarea } from '@/components/ui'
import { blogPostSchema, slugify, type BlogPostFormValues } from '@/lib/schemas/blogPost'
import { BLOG_STATUSES } from '@/lib/constants'
import type { BlogPost } from '@/types/database'

const emptyForm: BlogPostFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  cover_image_url: '',
  status: 'draft',
}

export function BlogPostFormModal({
  open,
  onClose,
  onSubmit,
  post,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: BlogPostFormValues) => void
  post?: BlogPost | null
  submitting?: boolean
}) {
  const [values, setValues] = useState<BlogPostFormValues>(emptyForm)
  const [slugTouched, setSlugTouched] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof BlogPostFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    if (post) {
      setValues({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? '',
        body: post.body,
        cover_image_url: post.cover_image_url ?? '',
        status: post.status,
      })
      setSlugTouched(true)
    } else {
      setValues(emptyForm)
      setSlugTouched(false)
    }
    setErrors({})
  }, [open, post])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = blogPostSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof BlogPostFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={post ? 'Edit post' : 'New post'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Title" error={errors.title}>
          <Input
            value={values.title}
            onChange={(e) => {
              const title = e.target.value
              setValues((v) => ({
                ...v,
                title,
                slug: slugTouched ? v.slug : slugify(title),
              }))
            }}
            placeholder="How we ship websites in two weeks"
          />
        </Field>
        <Field label="Slug" error={errors.slug} hint="Used in the URL once a public blog page exists">
          <Input
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true)
              setValues((v) => ({ ...v, slug: e.target.value }))
            }}
            placeholder="how-we-ship-websites-in-two-weeks"
          />
        </Field>
        <Field label="Excerpt">
          <Textarea
            rows={2}
            value={values.excerpt}
            onChange={(e) => setValues((v) => ({ ...v, excerpt: e.target.value }))}
            placeholder="One or two sentences for a preview card"
          />
        </Field>
        <Field label="Cover image URL">
          <Input
            value={values.cover_image_url}
            onChange={(e) => setValues((v) => ({ ...v, cover_image_url: e.target.value }))}
            placeholder="https://..."
          />
        </Field>
        <Field label="Body" error={errors.body}>
          <Textarea
            rows={10}
            value={values.body}
            onChange={(e) => setValues((v) => ({ ...v, body: e.target.value }))}
            placeholder="Write the post. Markdown is fine."
          />
        </Field>
        <Field label="Status">
          <Select
            value={values.status}
            onChange={(e) =>
              setValues((v) => ({ ...v, status: e.target.value as BlogPostFormValues['status'] }))
            }
          >
            {BLOG_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {post ? 'Save changes' : 'Create post'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
