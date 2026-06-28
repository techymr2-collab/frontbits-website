import { AlertTriangle } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({
  message = 'Something went wrong loading this data.',
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="size-6" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-ink">{message}</h3>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  )
}
