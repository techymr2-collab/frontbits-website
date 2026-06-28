import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export interface CrmUser {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: CrmUser | null
  loading: boolean
  /** True when running without a Supabase project (dev preview only). */
  previewMode: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const PREVIEW_MODE = import.meta.env.DEV && !isSupabaseConfigured

const PREVIEW_USER: CrmUser = {
  id: 'preview-user',
  email: 'admin@frontbits.com',
  name: 'Frontbits Admin',
}

const AuthContext = createContext<AuthState | undefined>(undefined)

function toCrmUser(session: Session | null): CrmUser | null {
  if (!session?.user) return null
  const { user } = session
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split('@')[0] ??
    'Team member'
  return { id: user.id, email: user.email ?? '', name }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CrmUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      // Preview mode: nothing to restore, start signed out.
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(toCrmUser(data.session))
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toCrmUser(session))
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) {
      // Preview mode accepts any input and drops you into the shell.
      setUser(PREVIEW_USER)
      return {}
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) {
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ user, loading, previewMode: PREVIEW_MODE, signIn, signOut }),
    [user, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
