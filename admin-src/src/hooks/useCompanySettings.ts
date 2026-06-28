import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getCompanySettings, updateCompanySettings } from '@/api/companySettings'
import type { CompanySettingsUpdate } from '@/api/companySettings'

export function useCompanySettings() {
  return useQuery({
    queryKey: queryKeys.companySettings.detail,
    queryFn: getCompanySettings,
  })
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CompanySettingsUpdate }) =>
      updateCompanySettings(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.companySettings.detail }),
  })
}
