import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import * as contactsApi from '@/api/contacts'
import type { ContactInsert, ContactUpdate } from '@/api/contacts'

export function useContactsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.contacts.byClient(clientId ?? ''),
    queryFn: () => contactsApi.listContacts(clientId as string),
    enabled: Boolean(clientId),
  })
}

export function useCreateContact(clientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ContactInsert) => contactsApi.createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.byClient(clientId) })
    },
  })
}

export function useUpdateContact(clientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactUpdate }) =>
      contactsApi.updateContact(id, clientId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.byClient(clientId) })
    },
  })
}

export function useDeleteContact(clientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contactsApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.byClient(clientId) })
    },
  })
}
