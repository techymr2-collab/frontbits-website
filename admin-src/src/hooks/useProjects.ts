import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as projectsApi from '@/api/projects'
import type { ProjectInsert, ProjectUpdate } from '@/api/projects'
import { queryKeys } from '@/lib/queryKeys'

export function useProjects() {
  return useQuery({ queryKey: queryKeys.projects.list, queryFn: projectsApi.listProjects })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id ?? ''),
    queryFn: () => projectsApi.getProject(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInsert) => projectsApi.createProject(input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byClient(project.client_id) })
    },
  })
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectUpdate) => projectsApi.updateProject(id, input),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.byClient(project.client_id) })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list })
    },
  })
}
