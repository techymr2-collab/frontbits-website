import type {
  BlogStatus,
  BookingStatus,
  ClientStatus,
  Country,
  Currency,
  LeadSource,
  LeadStatus,
  PricingTier,
  ProjectStatus,
  TaskStatus,
} from '@/types/database'
import type { BadgeTone } from '@/components/ui/Badge'

export const CURRENCIES: Currency[] = ['AED', 'USD']

export const COUNTRIES: Country[] = ['UAE', 'UK', 'US', 'Canada', 'other']

export const CLIENT_STATUSES: ClientStatus[] = ['Active', 'Inactive']

export const LEAD_SOURCES: LeadSource[] = [
  'referral',
  'inbound',
  'outbound',
  'event',
  'website',
  'other',
]

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Won',
  'Lost',
]

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Discovery',
  'In Progress',
  'Review',
  'Delivered',
  'On Hold',
]

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'Doing', 'Done']

export const LEAD_STATUS_TONE: Record<LeadStatus, BadgeTone> = {
  New: 'brand',
  Contacted: 'amber',
  Qualified: 'purple',
  Proposal: 'slate',
  Won: 'green',
  Lost: 'red',
}

export const PROJECT_STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  Discovery: 'slate',
  'In Progress': 'brand',
  Review: 'amber',
  Delivered: 'green',
  'On Hold': 'red',
}

export const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  'To Do': 'slate',
  Doing: 'brand',
  Done: 'green',
}

export const BOOKING_STATUSES: BookingStatus[] = ['confirmed', 'cancelled', 'rescheduled']

export const BOOKING_STATUS_TONE: Record<BookingStatus, BadgeTone> = {
  confirmed: 'green',
  cancelled: 'red',
  rescheduled: 'amber',
}

export const BLOG_STATUSES: BlogStatus[] = ['draft', 'published']

export const BLOG_STATUS_TONE: Record<BlogStatus, BadgeTone> = {
  draft: 'slate',
  published: 'green',
}

/**
 * AED amount for each fixed pricing tier. Custom projects skip this map and
 * store a manually entered budget instead.
 */
export const PRICING_TIER_AMOUNTS: Record<Exclude<PricingTier, 'Custom'>, number> = {
  Starter: 4900,
  Growth: 12000,
  Scale: 24000,
}

export const PRICING_TIERS: PricingTier[] = ['Starter', 'Growth', 'Scale', 'Custom']
