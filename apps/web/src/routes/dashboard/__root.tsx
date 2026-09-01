import { Separator } from '@rozumari/ui/components/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@rozumari/ui/components/sidebar'
import { useLayoutEffect } from 'react'
import { Outlet, useNavigate } from 'react-router'

import { useSession } from '@/lib/use-session'
import { Breadcrumbs } from '@/routes/dashboard/_components/breadcrumbs'
import { DashboardSidebar } from '@/routes/dashboard/_components/dashboard-sidebar'

export default function DashboardRoot() {
  const { user } = useSession()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if (!user) navigate('/login', { replace: true })
  }, [user, navigate])

  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4'>
          <SidebarTrigger className='-ml-1' />
          <Separator
            orientation='vertical'
            className='mr-2 h-4 data-vertical:self-center'
          />

          <Breadcrumbs />
        </header>

        <section className='px-4 py-6'>
          <Outlet />
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
