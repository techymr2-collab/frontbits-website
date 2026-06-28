import type { LucideIcon } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { PageHeader } from './PageHeader'

export function ComingSoon({
  title,
  description,
  icon,
  phase,
}: {
  title: string
  description: string
  icon: LucideIcon
  phase: string
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={icon}
        title={`${title} is coming next`}
        description={`This module lands in ${phase}. The app shell, navigation, and auth are ready now.`}
      />
    </>
  )
}
