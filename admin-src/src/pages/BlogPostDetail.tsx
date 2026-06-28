import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, Button, Card, CardBody, ConfirmDialog, ErrorState, Skeleton } from '@/components/ui'
import { BlogPostFormModal } from '@/components/blog/BlogPostFormModal'
import { useBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/hooks/useBlogPosts'
import { emptyToNull } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { BLOG_STATUS_TONE } from '@/lib/constants'
import type { BlogPostFormValues } from '@/lib/schemas/blogPost'

export default function BlogPostDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: post, isLoading, isError, refetch } = useBlogPost(id)
  const updatePost = useUpdateBlogPost(id ?? '')
  const deletePost = useDeleteBlogPost()

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !post) {
    return <ErrorState message="We could not load this post." onRetry={refetch} />
  }

  async function handleEditSubmit(values: BlogPostFormValues) {
    const cleaned = emptyToNull(values)
    const wasPublished = post!.status === 'published'
    const willPublish = cleaned.status === 'published'
    await updatePost.mutateAsync({
      ...cleaned,
      published_at: !wasPublished && willPublish ? new Date().toISOString() : post!.published_at,
    })
    setEditOpen(false)
  }

  async function handleDelete() {
    if (!post) return
    await deletePost.mutateAsync(post.id)
    navigate('/blog')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/blog')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to blog
      </button>

      <PageHeader
        title={post.title}
        description={post.excerpt || 'No excerpt set'}
        actions={
          <>
            <Badge tone={BLOG_STATUS_TONE[post.status]}>{post.status}</Badge>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="danger" onClick={() => setConfirmDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </>
        }
      />

      <div className="mb-4 text-xs text-ink-mute">
        Slug: <span className="font-mono">{post.slug}</span> · Last updated{' '}
        {formatDate(post.updated_at)}
        {post.published_at && <> · Published {formatDate(post.published_at)}</>}
      </div>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="mb-4 max-h-80 w-full rounded-xl border border-line object-cover"
        />
      )}

      <Card>
        <CardBody>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{post.body}</p>
        </CardBody>
      </Card>

      <BlogPostFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        post={post}
        submitting={updatePost.isPending}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this post?"
        description="This permanently deletes the post. This cannot be undone."
        loading={deletePost.isPending}
      />
    </>
  )
}
