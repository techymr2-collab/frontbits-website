import type { DragEvent } from 'react'
import { Calendar, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useUpdateTaskStatus, useDeleteTask } from '@/hooks/useTasks'
import { useProfiles } from '@/hooks/useProfiles'
import { TASK_STATUSES } from '@/lib/constants'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/types/database'

const TASK_DRAG_TYPE = 'application/x-task-id'

function TaskCard({
  task,
  assigneeName,
  onEdit,
  onDelete,
}: {
  task: Task
  assigneeName: string | null
  onEdit: () => void
  onDelete: () => void
}) {
  const isOverdue =
    task.status !== 'Done' &&
    Boolean(task.due_date) &&
    new Date(task.due_date as string) < new Date(new Date().toDateString())

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData(TASK_DRAG_TYPE, task.id)}
      onClick={onEdit}
      className="group cursor-pointer rounded-xl border border-line bg-surface p-3 shadow-sm transition-colors hover:border-line-strong"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-ink">{task.title}</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="rounded-md p-1 text-ink-mute opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
          aria-label="Delete task"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {task.due_date ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs',
              isOverdue ? 'text-red-600' : 'text-ink-mute',
            )}
          >
            <Calendar className="size-3" />
            {formatDate(task.due_date)}
          </span>
        ) : (
          <span />
        )}
        {assigneeName && <Avatar name={assigneeName} className="size-6 text-[10px]" />}
      </div>
    </div>
  )
}

export function TaskBoard({
  tasks,
  projectId,
  onEditTask,
}: {
  tasks: Task[]
  projectId: string
  onEditTask: (task: Task) => void
}) {
  const { data: profiles } = useProfiles()
  const updateStatus = useUpdateTaskStatus(projectId)
  const deleteTask = useDeleteTask(projectId)

  function assigneeName(assigneeId: string | null) {
    if (!assigneeId) return null
    return profiles?.find((p) => p.id === assigneeId)?.full_name ?? null
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, status: TaskStatus) {
    e.preventDefault()
    const id = e.dataTransfer.getData(TASK_DRAG_TYPE)
    if (!id) return
    const task = tasks.find((t) => t.id === id)
    if (!task || task.status === status) return
    updateStatus.mutate({ id, status })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status)
        return (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, status)}
            className="flex flex-col rounded-xl bg-muted/60 p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-ink-soft">{status}</span>
              <span className="text-xs text-ink-mute">{columnTasks.length}</span>
            </div>
            <div className="flex min-h-12 flex-col gap-2">
              {columnTasks.length === 0 ? (
                <p className="px-1 text-xs text-ink-mute">No tasks here</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    assigneeName={assigneeName(task.assignee_id)}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => deleteTask.mutate(task.id)}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
