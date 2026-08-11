import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from '@rozumari/ui/components/sidebar'

import type { NavGroupConfig } from '@/routes/dashboard/_components/dashboard-sidebar/config'

import {
  NavCollapsibleItem,
  NavSingleItem,
} from '@/routes/dashboard/_components/dashboard-sidebar/shared'

export function NavMain({ groups }: { groups: NavGroupConfig[] }) {
  return groups.map((group, idx) => (
    <SidebarGroup key={group.label ?? idx}>
      {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}

      <SidebarMenu>
        {group.items.map((item) =>
          item.items ? (
            <NavCollapsibleItem key={item.title} item={item} />
          ) : (
            <NavSingleItem key={item.title} item={item} />
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  ))
}
