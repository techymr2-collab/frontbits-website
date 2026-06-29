import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button, DatePicker, Field, Input, Select } from '@/components/ui'
import { taskSchema, type TaskFormValues } from '@/lib/schemas/task'
import { TASK_STATUSES } from '@/lib/constants'
import { toDateInputValue } from '@/lib/format'
import { useProfiles } from '@/hooks/useProfiles'
import type { Task } from '@/types/database'

const emptyForm: TaskFormValues = {
  title: '',
  status: 'To Do',
  due_date: '',
  assignee_id: '',
}

export function TaskFormModal({
  open,
  onClose,
  onSubmit,
  task,
  submitting,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: TaskFormValues) => void
  task?: Task | null
  submitting?: boolean
}) {
  const { data: profiles } = useProfiles()
  const [values, setValues] = useState<TaskFormValues>(emptyForm)
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    if (task) {
      setValues({
        title: task.title,
        status: task.status,
        due_date: toDateInputValue(task.due_date),
        assignee_id: task.assignee_id ?? '',
      })
    } else {
      setValues(emptyForm)
    }
    setErrors({})
  }, [open, task])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = taskSchema.safeParse(values)
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof TaskFormValues] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    onSubmit(parsed.data)
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'Add task'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Field label="Title" error={errors.title}>
          <Input
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            placeholder="Draft the homepage wireframes"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select
              value={values.status}
              onChange={(e) =>
                setValues((v) => ({ ...v, status: e.target.value as TaskFormValues['status'] }))
              }
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Due date">
            <DatePicker
              value={values.due_date}
              onChange={(e) => setValues((v) => ({ ...v, due_date: e.target.value }))}
            />
          </Field>
          <Field label="Assignee">
            <Select
              value={values.assignee_id}
              onChange={(e) => setValues((v) => ({ ...v, assignee_id: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {profiles?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            {task ? 'Save changes' : 'Add task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
