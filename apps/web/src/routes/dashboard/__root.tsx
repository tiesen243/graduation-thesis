import { Loader2Icon } from '@rozumari/ui/components/icons'
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
  const { status } = useSession()
  const navigate = useNavigate()

  useLayoutEffect(() => {
    if (status === 'unauthenticated') navigate('/login', { replace: true })
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
