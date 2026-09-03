import { Card } from '@rozumari/ui/components/card'
import { Loader2Icon } from '@rozumari/ui/components/icons'
import { useLayoutEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { useSession } from '@/lib/use-session'

export default function AuthRoot() {
  const { status } = useSession()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if (status === 'authenticated') navigate('/dashboard', { replace: true })
  }, [navigate, status])

  if (status === 'loading')
    return (
      <div className='flex h-screen items-center justify-center'>
        <Loader2Icon className='size-8 animate-spin' />
      </div>
    )

  return (
    <main className='grid min-h-dvh place-items-center md:px-4'>
      <Card className='w-full max-w-2xl bg-background ring-0 md:bg-card md:ring-1'>
        <Outlet />
      </Card>
    </main>
  )
}
