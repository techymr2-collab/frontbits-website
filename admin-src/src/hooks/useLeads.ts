import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as leadsApi from '@/api/leads'
import type { LeadInsert, LeadUpdate } from '@/api/leads'
import { queryKeys } from '@/lib/queryKeys'
import type { Lead, LeadStatus } from '@/types/database'

export function useLeads() {
  return useQuery({ queryKey: queryKeys.leads.list, queryFn: leadsApi.listLeads })
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id ?? ''),
    queryFn: () => leadsApi.getLead(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadInsert) => leadsApi.createLead(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leads.list }),
  })
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LeadUpdate) => leadsApi.updateLead(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(id) })
    },
  })
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      status,
      lost_reason,
    }: {
      id: string
      status: LeadStatus
      lost_reason?: string
    }) => leadsApi.updateLead(id, lost_reason !== undefined ? { status, lost_reason } : { status }),
    onMutate: async ({ id, status, lost_reason }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.leads.list })
      const previous = queryClient.getQueryData<Lead[]>(queryKeys.leads.list)
      if (previous) {
        queryClient.setQueryData<Lead[]>(
          queryKeys.leads.list,
          previous.map((lead) =>
            lead.id === id
              ? { ...lead, status, ...(lost_reason !== undefined ? { lost_reason } : {}) }
              : lead,
          ),
        )
      }
      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.leads.list, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list })
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => leadsApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list })
    },
  })
}

export function useConvertLead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lead: Lead) => leadsApi.convertLeadToClient(lead),
    onSuccess: (_client, lead) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.list })
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.detail(lead.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.clients.list })
    },
  })
}
