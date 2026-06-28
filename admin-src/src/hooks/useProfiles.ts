import { useQuery } from '@tanstack/react-query'
import { listProfiles } from '@/api/profiles'
import { queryKeys } from '@/lib/queryKeys'

export function useProfiles() {
  return useQuery({ queryKey: queryKeys.profiles.list, queryFn: listProfiles })
}
