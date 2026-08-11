import { TargetIcon } from '@rozumari/ui/components/icons'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@rozumari/ui/components/sidebar'

import { env } from '@/lib/env'
import {
  navGroups,
  secondaryNavItems,
} from '@/routes/dashboard/_components/dashboard-sidebar/config'
import { NavMain } from '@/routes/dashboard/_components/dashboard-sidebar/nav-main'
import { NavSecondary } from '@/routes/dashboard/_components/dashboard-sidebar/nav-secondary'
import { NavUser } from '@/routes/dashboard/_components/dashboard-sidebar/nav-user'

export function DashboardSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' variant='outline'>
              <TargetIcon className='size-6! group-data-[state=collapsed]:ml-1' />
              <div className='grid flex-1 text-left leading-tight'>
                <span className='truncate text-sm font-semibold'>
                  {env.VITE_APP_NAME}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  Smart Pill Box
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain groups={navGroups} />
        <NavSecondary items={secondaryNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
