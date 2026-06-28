import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" />
      <EmptyState
        icon={Compass}
        title="We could not find that page"
        description="The page may have moved or never existed. Head back to the dashboard."
        action={
          <Link to="/">
            <Button>Go to dashboard</Button>
          </Link>
        }
      />
    </>
  )
}
