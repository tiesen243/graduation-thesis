import { Card } from '@rozumari/ui/components/card'
import { useQuery } from '@tanstack/react-query'
import { Navigate, Outlet } from 'react-router'

import { api } from '@/lib/runtime'

export default function AuthRoot() {
  const { data, isLoading } = useQuery(
    api.auth.whoami.queryOptions(undefined, { retry: 1 })
  )

  if (isLoading) return <div>Loading...</div>

  if (data?.data) return <Navigate to='/dashboard' replace />

  return (
    <main className='grid min-h-dvh place-items-center md:px-4'>
      <Card className='w-full max-w-2xl bg-background ring-0 md:bg-card md:ring-1'>
        <Outlet />
      </Card>
    </main>
  )
}
