import { Card } from '@rozumari/ui/components/card'
import { useLayoutEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { useSession } from '@/lib/use-session'

export default function AuthRoot() {
  const { user } = useSession()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  return (
    <main className='grid min-h-dvh place-items-center md:px-4'>
      <Card className='w-full max-w-2xl bg-background ring-0 md:bg-card md:ring-1'>
        <Outlet />
      </Card>
    </main>
  )
}
