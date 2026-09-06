import { Loader2Icon } from '@rozumari/ui/components/icons'
import { Separator } from '@rozumari/ui/components/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@rozumari/ui/components/sidebar'
import { useIsomorphicLayoutEffect } from '@rozumari/ui/hooks/use-isomorphic-layout-effect'
import { Outlet, useNavigate } from 'react-router'

import { useSession } from '@/hooks/use-session'
import { Breadcrumbs } from '@/routes/dashboard/_components/breadcrumbs'
import { DashboardSidebar } from '@/routes/dashboard/_components/dashboard-sidebar'

export default function DashboardRoot() {
  const { status } = useSession()
  const navigate = useNavigate()

  useIsomorphicLayoutEffect(() => {
    let isMounted = true

    if (status === 'unauthenticated' && isMounted)
      navigate('/login', { replace: true })

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
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset className='min-w-0' suppressHydrationWarning>
        <header className='sticky inset-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-4'>
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
