export const queryKeys = {
  clients: {
    list: ['clients', 'list'] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  contacts: {
    byClient: (clientId: string) => ['contacts', 'client', clientId] as const,
  },
  projects: {
    list: ['projects', 'list'] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    byClient: (clientId: string) => ['projects', 'client', clientId] as const,
  },
  tasks: {
    byProject: (projectId: string) => ['tasks', 'project', projectId] as const,
  },
  companySettings: {
    detail: ['companySettings', 'detail'] as const,
  },
  leads: {
    list: ['leads', 'list'] as const,
    detail: (id: string) => ['leads', 'detail', id] as const,
  },
  leadNotes: {
    byLead: (leadId: string) => ['leadNotes', 'lead', leadId] as const,
  },
  profiles: {
    list: ['profiles', 'list'] as const,
  },
  bookings: {
    list: ['bookings', 'list'] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  blogPosts: {
    list: ['blogPosts', 'list'] as const,
    detail: (id: string) => ['blogPosts', 'detail', id] as const,
  },
}
