import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as tasksApi from '@/api/tasks'
import type { TaskInsert, TaskUpdate } from '@/api/tasks'
import { queryKeys } from '@/lib/queryKeys'
import type { Task, TaskStatus } from '@/types/database'

export function useTasksByProject(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.byProject(projectId ?? ''),
    queryFn: () => tasksApi.listTasksByProject(projectId as string),
    enabled: Boolean(projectId),
  })
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskInsert) => tasksApi.createTask(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) }),
  })
}

export function useUpdateTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskUpdate }) => tasksApi.updateTask(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) }),
  })
}

export function useUpdateTaskStatus(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      const queryKey = queryKeys.tasks.byProject(projectId)
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<Task[]>(queryKey)
      if (previous) {
        queryClient.setQueryData<Task[]>(
          queryKey,
          previous.map((task) => (task.id === id ? { ...task, status } : task)),
        )
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.byProject(projectId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) })
    },
  })
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.byProject(projectId) }),
  })
}
