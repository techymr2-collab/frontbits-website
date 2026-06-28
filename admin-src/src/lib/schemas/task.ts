import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Enter a task title'),
  status: z.enum(['To Do', 'Doing', 'Done']),
  due_date: z.string().optional().or(z.literal('')),
  assignee_id: z.string().optional().or(z.literal('')),
})

export type TaskFormValues = z.infer<typeof taskSchema>
