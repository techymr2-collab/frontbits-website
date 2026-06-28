import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as leadNotesApi from '@/api/leadNotes'
import type { LeadNoteInsert } from '@/api/leadNotes'
import { queryKeys } from '@/lib/queryKeys'

export function useLeadNotes(leadId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leadNotes.byLead(leadId ?? ''),
    queryFn: () => leadNotesApi.listLeadNotes(leadId as string),
    enabled: Boolean(leadId),
  })
}

export function useCreateLeadNote(leadId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadNoteInsert) => leadNotesApi.createLeadNote(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leadNotes.byLead(leadId) }),
  })
}
