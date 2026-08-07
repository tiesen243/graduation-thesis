import { SidebarGroup, SidebarMenu } from '@rozumari/ui/components/sidebar'

import type { NavItem } from '@/routes/dashboard/_components/dashboard-sidebar/config'

import { NavSingleItem } from '@/routes/dashboard/_components/dashboard-sidebar/shared'

export function NavSecondary({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup className='mt-auto'>
      <SidebarMenu>
        {items.map((item) => (
          <NavSingleItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
