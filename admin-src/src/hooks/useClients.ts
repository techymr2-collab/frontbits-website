import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import * as clientsApi from '@/api/clients'
import type { ClientInsert, ClientUpdate } from '@/api/clients'

export function useClients() {
  return useQuery({ queryKey: queryKeys.clients.list, queryFn: clientsApi.listClients })
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.clients.detail(id ?? ''),
    queryFn: () => clientsApi.getClient(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ClientInsert) => clientsApi.createClient(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.list })
    },
  })
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ClientUpdate) => clientsApi.updateClient(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.list })
    },
  })
}
