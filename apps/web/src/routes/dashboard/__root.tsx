import { Separator } from '@rozumari/ui/components/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@rozumari/ui/components/sidebar'
import { Navigate, Outlet } from 'react-router'

import { useSession } from '@/lib/use-session'
import { DashboardSidebar } from '@/routes/dashboard/_components/dashboard-sidebar'

export default function DashboardRoot() {
  const { user } = useSession()
  if (!user) return <Navigate to='/login' replace />

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

          <div className='flex flex-col'>
            <h1 className='text-sm leading-none font-semibold'>Dashboard</h1>
            <p className='text-xs text-muted-foreground'>
              Medication adherence overview
            </p>
          </div>
        </header>

        <section className='px-4 py-6'>
          <Outlet />
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
