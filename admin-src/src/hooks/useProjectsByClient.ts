import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { listProjectsByClient } from '@/api/projects'

export function useProjectsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.byClient(clientId ?? ''),
    queryFn: () => listProjectsByClient(clientId as string),
    enabled: Boolean(clientId),
  })
}
