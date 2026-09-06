import { Card } from '@rozumari/ui/components/card'
import { Loader2Icon } from '@rozumari/ui/components/icons'
import { useIsomorphicLayoutEffect } from '@rozumari/ui/hooks/use-isomorphic-layout-effect'
import { Outlet, useNavigate } from 'react-router'

import { useSession } from '@/hooks/use-session'

export default function AuthRoot() {
  const { status } = useSession()
  const navigate = useNavigate()

  useIsomorphicLayoutEffect(() => {
    let isMounted = true

    if (status === 'authenticated' && isMounted)
      navigate('/dashboard', { replace: true })

    return () => {
      isMounted = false
    }
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
