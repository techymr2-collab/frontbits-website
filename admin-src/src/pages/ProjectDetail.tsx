import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
  StatCard,
} from '@/components/ui'
import { ProjectFormModal } from '@/components/projects/ProjectFormModal'
import { TaskFormModal } from '@/components/projects/TaskFormModal'
import { TaskBoard } from '@/components/projects/TaskBoard'
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/useProjects'
import { useClient } from '@/hooks/useClients'
import { useTasksByProject, useCreateTask, useUpdateTask } from '@/hooks/useTasks'
import { emptyToNull } from '@/lib/utils'
import { formatDate, formatMoney } from '@/lib/format'
import { PROJECT_STATUS_TONE } from '@/lib/constants'
import type { ProjectFormValues } from '@/lib/schemas/project'
import type { TaskFormValues } from '@/lib/schemas/task'
import type { Task } from '@/types/database'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-xs font-medium text-ink-mute">{label}</span>
      <span className="text-right text-sm text-ink">{value}</span>
    </div>
  )
}

function toProjectPayload(values: ProjectFormValues) {
  const cleaned = emptyToNull(values)
  return { ...cleaned, budget: Number(cleaned.budget) }
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: project, isLoading, isError, refetch } = useProject(id)
  const { data: client } = useClient(project?.client_id)
  const { data: tasks, isLoading: tasksLoading } = useTasksByProject(id)

  const updateProject = useUpdateProject(id ?? '')
  const deleteProject = useDeleteProject()
  const createTask = useCreateTask(id ?? '')
  const updateTask = useUpdateTask(id ?? '')

  const [editOpen, setEditOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task | null }>({ open: false })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !project) {
    return <ErrorState message="We could not load this project." onRetry={refetch} />
  }

  const doneTasks = (tasks ?? []).filter((t) => t.status === 'Done').length

  async function handleEditSubmit(values: ProjectFormValues) {
    await updateProject.mutateAsync(toProjectPayload(values))
    setEditOpen(false)
  }

  async function handleDelete() {
    if (!project) return
    await deleteProject.mutateAsync(project.id)
    navigate('/projects')
  }

  async function handleTaskSubmit(values: TaskFormValues) {
    if (!project) return
    const payload = emptyToNull(values)
    if (taskModal.task) {
      await updateTask.mutateAsync({ id: taskModal.task.id, input: payload })
    } else {
      await createTask.mutateAsync({ ...payload, project_id: project.id })
    }
    setTaskModal({ open: false })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/projects')}
        className="mb-2 flex items-center gap-1 text-sm text-ink-mute hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </button>

      {client && (
        <Link
          to={`/clients/${client.id}`}
          className="mb-1 block text-sm text-brand-600 hover:underline"
        >
          {client.company_name}
        </Link>
      )}

      <PageHeader
        title={project.name}
        actions={
          <>
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Budget" value={formatMoney(project.budget, project.currency)} />
        <StatCard label="Tasks" value={tasks?.length ?? 0} />
        <StatCard
          label="Completed"
          value={doneTasks}
          tone={tasks && tasks.length > 0 && doneTasks === tasks.length ? 'green' : 'neutral'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader title="Project details" />
            <CardBody className="divide-y divide-line">
              <DetailRow
                label="Status"
                value={<Badge tone={PROJECT_STATUS_TONE[project.status]}>{project.status}</Badge>}
              />
              <DetailRow label="Pricing tier" value={project.pricing_tier} />
              <DetailRow label="Currency" value={project.currency} />
              <DetailRow
                label="Start date"
                value={project.start_date ? formatDate(project.start_date) : 'Not set'}
              />
              <DetailRow
                label="Target delivery"
                value={project.target_delivery_date ? formatDate(project.target_delivery_date) : 'Not set'}
              />
              <DetailRow label="Description" value={project.description || 'No description yet'} />
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Tasks"
              description={`${tasks?.length ?? 0} tasks`}
              action={
                <Button size="sm" variant="secondary" onClick={() => setTaskModal({ open: true })}>
                  <Plus className="size-4" />
                  Add task
                </Button>
              }
            />
            <CardBody>
              {tasksLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : !tasks || tasks.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="No tasks yet"
                  description="Break this project down into tasks your team can track."
                  action={
                    <Button size="sm" onClick={() => setTaskModal({ open: true })}>
                      <Plus className="size-4" />
                      Add task
                    </Button>
                  }
                />
              ) : (
                <TaskBoard
                  tasks={tasks}
                  projectId={project.id}
                  onEditTask={(task) => setTaskModal({ open: true, task })}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        project={project}
        submitting={updateProject.isPending}
      />

      <TaskFormModal
        open={taskModal.open}
        onClose={() => setTaskModal({ open: false })}
        onSubmit={handleTaskSubmit}
        task={taskModal.task}
        submitting={createTask.isPending || updateTask.isPending}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete this project?"
        description="This permanently deletes the project and its tasks. This cannot be undone."
        loading={deleteProject.isPending}
      />
    </>
  )
}
