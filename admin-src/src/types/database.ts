/**
 * Hand authored to match supabase/migrations exactly. Shaped the same way
 * `supabase gen types typescript --project-id <ref> --schema public` would
 * output, so once the project is linked you can regenerate this file in
 * place without touching any code that imports from it.
 */

export type Currency = 'AED' | 'USD'
export type Country = 'UAE' | 'UK' | 'US' | 'Canada' | 'other'
export type ProfileRole = 'admin' | 'member'
export type ClientStatus = 'Active' | 'Inactive'
export type LeadSource = 'referral' | 'inbound' | 'outbound' | 'event' | 'website' | 'other'
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Won' | 'Lost'
export type ProjectStatus = 'Discovery' | 'In Progress' | 'Review' | 'Delivered' | 'On Hold'
export type PricingTier = 'Starter' | 'Growth' | 'Scale' | 'Custom'
export type TaskStatus = 'To Do' | 'Doing' | 'Done'
export type BookingStatus = 'confirmed' | 'cancelled' | 'rescheduled'
export type BlogStatus = 'draft' | 'published'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: ProfileRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string
          role?: ProfileRole
          avatar_url?: string | null
        }
        Update: {
          full_name?: string
          role?: ProfileRole
          avatar_url?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          id: string
          company_name: string
          address: string | null
          trn: string | null
          default_currency: Currency
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['company_settings']['Row']>
        Update: Partial<Database['public']['Tables']['company_settings']['Row']>
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          company_name: string
          primary_contact_name: string | null
          email: string | null
          phone: string | null
          country: Country
          city: string | null
          trn: string | null
          billing_currency: Currency
          billing_address: string | null
          status: ClientStatus
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          company_name: string
          primary_contact_name?: string | null
          email?: string | null
          phone?: string | null
          country?: Country
          city?: string | null
          trn?: string | null
          billing_currency?: Currency
          billing_address?: string | null
          status?: ClientStatus
          notes?: string | null
        }
        Update: Partial<Database['public']['Tables']['clients']['Insert']> & {
          deleted_at?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          client_id: string
          name: string
          role: string | null
          email: string | null
          phone: string | null
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          role?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean
        }
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>
        Relationships: []
      }
      leads: {
        Row: {
          id: string
          name: string
          company: string | null
          email: string | null
          phone: string | null
          source: LeadSource
          status: LeadStatus
          estimated_value: number | null
          currency: Currency
          owner_id: string | null
          notes: string | null
          next_follow_up_date: string | null
          converted_client_id: string | null
          lost_reason: string | null
          project_type: string | null
          budget_range: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          email?: string | null
          phone?: string | null
          source?: LeadSource
          status?: LeadStatus
          estimated_value?: number | null
          currency?: Currency
          owner_id?: string | null
          notes?: string | null
          next_follow_up_date?: string | null
          converted_client_id?: string | null
          lost_reason?: string | null
          project_type?: string | null
          budget_range?: string | null
        }
        Update: Partial<Database['public']['Tables']['leads']['Insert']> & {
          deleted_at?: string | null
        }
        Relationships: []
      }
      lead_notes: {
        Row: {
          id: string
          lead_id: string
          author_id: string | null
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          author_id?: string | null
          body: string
        }
        Update: Partial<Database['public']['Tables']['lead_notes']['Insert']>
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          description: string | null
          status: ProjectStatus
          pricing_tier: PricingTier
          budget: number
          currency: Currency
          start_date: string | null
          target_delivery_date: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          description?: string | null
          status?: ProjectStatus
          pricing_tier?: PricingTier
          budget?: number
          currency?: Currency
          start_date?: string | null
          target_delivery_date?: string | null
          owner_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']> & {
          deleted_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          status: TaskStatus
          due_date: string | null
          assignee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          status?: TaskStatus
          due_date?: string | null
          assignee_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          cal_booking_uid: string
          attendee_name: string
          attendee_email: string
          attendee_phone: string | null
          start_time: string
          end_time: string
          status: BookingStatus
          meeting_url: string | null
          cal_notes: string | null
          internal_notes: string | null
          lead_id: string | null
          raw_payload: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cal_booking_uid: string
          attendee_name: string
          attendee_email: string
          attendee_phone?: string | null
          start_time: string
          end_time: string
          status?: BookingStatus
          meeting_url?: string | null
          cal_notes?: string | null
          internal_notes?: string | null
          lead_id?: string | null
          raw_payload: Record<string, unknown>
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          body: string
          cover_image_url: string | null
          status: BlogStatus
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          body: string
          cover_image_url?: string | null
          status?: BlogStatus
          published_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type Tables = Database['public']['Tables']
export type Profile = Tables['profiles']['Row']
export type CompanySettings = Tables['company_settings']['Row']
export type Client = Tables['clients']['Row']
export type Contact = Tables['contacts']['Row']
export type Lead = Tables['leads']['Row']
export type LeadNote = Tables['lead_notes']['Row']
export type Project = Tables['projects']['Row']
export type Task = Tables['tasks']['Row']
export type Booking = Tables['bookings']['Row']
export type BlogPost = Tables['blog_posts']['Row']
