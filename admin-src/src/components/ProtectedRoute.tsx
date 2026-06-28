import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { FullPageSpinner } from '@/components/ui'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageSpinner label="Loading your workspace" />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <>{children}</>
}
