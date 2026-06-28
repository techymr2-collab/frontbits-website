import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Newspaper, Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Button,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Th,
  Td,
} from '@/components/ui'
import { BlogPostFormModal } from '@/components/blog/BlogPostFormModal'
import { useBlogPosts, useCreateBlogPost } from '@/hooks/useBlogPosts'
import { formatDate } from '@/lib/format'
import { emptyToNull } from '@/lib/utils'
import { BLOG_STATUSES, BLOG_STATUS_TONE } from '@/lib/constants'
import type { BlogPostFormValues } from '@/lib/schemas/blogPost'
import type { BlogStatus } from '@/types/database'

export default function BlogPosts() {
  const { data: posts, isLoading, isError, refetch } = useBlogPosts()
  const createPost = useCreateBlogPost()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BlogStatus>('all')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!posts) return []
    let rows = posts
    if (statusFilter !== 'all') rows = rows.filter((p) => p.status === statusFilter)
    const q = search.trim().toLowerCase()
    if (q) rows = rows.filter((p) => p.title.toLowerCase().includes(q))
    return rows
  }, [posts, search, statusFilter])

  async function handleCreate(values: BlogPostFormValues) {
    const cleaned = emptyToNull(values)
    const created = await createPost.mutateAsync({
      ...cleaned,
      published_at: cleaned.status === 'published' ? new Date().toISOString() : null,
    })
    setModalOpen(false)
    navigate(`/blog/${created.id}`)
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Draft and publish posts. There's no public page yet -- this is the writing workspace."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            New post
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          icon={<Search className="size-4" />}
          placeholder="Search by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BlogStatus)}
          className="w-40"
        >
          <option value="all">All statuses</option>
          {BLOG_STATUSES.map((s) => (
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
          <ErrorState message="We could not load your posts." onRetry={refetch} />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Newspaper}
            title={posts && posts.length > 0 ? 'No posts match your search' : 'No posts yet'}
            description={
              posts && posts.length > 0
                ? 'Try a different search term.'
                : 'Write your first post to get started.'
            }
            action={
              !posts || posts.length === 0 ? (
                <Button onClick={() => setModalOpen(true)}>
                  <Plus className="size-4" />
                  New post
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <Table>
              <TableHead>
                <tr>
                  <Th>Title</Th>
                  <Th>Status</Th>
                  <Th>Published</Th>
                  <Th>Last updated</Th>
                </tr>
              </TableHead>
              <TableBody>
                {filtered.map((post) => (
                  <TableRow key={post.id} onClick={() => navigate(`/blog/${post.id}`)}>
                    <Td className="font-medium">{post.title}</Td>
                    <Td>
                      <Badge tone={BLOG_STATUS_TONE[post.status]}>{post.status}</Badge>
                    </Td>
                    <Td className="text-ink-soft">
                      {post.published_at ? formatDate(post.published_at) : '—'}
                    </Td>
                    <Td className="text-ink-mute">{formatDate(post.updated_at)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <BlogPostFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        submitting={createPost.isPending}
      />
    </>
  )
}
