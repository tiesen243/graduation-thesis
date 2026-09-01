import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from '@rozumari/ui/components/sidebar'
import { useMemo } from 'react'

import type { NavGroupConfig } from '@/routes/dashboard/_components/dashboard-sidebar/config'

import { useSession } from '@/lib/use-session'
import {
  NavCollapsibleItem,
  NavSingleItem,
} from '@/routes/dashboard/_components/dashboard-sidebar/shared'

export function NavMain({ groups }: { groups: NavGroupConfig[] }) {
  const { user } = useSession()

  const filteredGroups = useMemo(
    () =>
      groups.map((group) => {
        const filteredItems = group.items.filter((item) => {
          if (item.isAdminOnly && user?.role !== 'admin') return false
          return true
        })

        return {
          ...group,
          items: filteredItems,
        }
      }),
    [groups, user]
  )

  return filteredGroups.map((group, idx) =>
    group.items.length === 0 ? null : (
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
    )
  )
}
