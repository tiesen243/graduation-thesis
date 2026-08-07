import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@rozumari/ui/components/collapsible'
import { ChevronRightIcon, Loader2Icon } from '@rozumari/ui/components/icons'
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@rozumari/ui/components/sidebar'
import { NavLink } from 'react-router'

import type { NavItem } from '@/routes/dashboard/_components/dashboard-sidebar/config'

export function NavSingleItem({ item }: { item: NavItem }) {
  const Icon = item.icon
  if (!item.url) return null

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        render={
          <NavLink to={item.url}>
            {({ isActive, isPending }) => (
              <>
                {Icon && <Icon className={isActive ? 'stroke-primary' : ''} />}
                <span className='truncate'>{item.title}</span>

                {isPending && <Loader2Icon className='ml-auto animate-spin' />}
                {item.badge && !isPending && (
                  <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                )}
              </>
            )}
          </NavLink>
        }
      />
    </SidebarMenuItem>
  )
}

export function NavCollapsibleItem({ item }: { item: NavItem }) {
  const Icon = item.icon

  return (
    <Collapsible render={<SidebarMenuItem />} defaultOpen>
      <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} />}>
        <Icon />
        <span>{item.title}</span>
        <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-open/menu-item:rotate-90' />
      </CollapsibleTrigger>

      <CollapsibleContent render={<SidebarMenuSub />}>
        {item.items?.map((sub) => {
          const SubIcon = sub.icon

          return (
            <SidebarMenuSubItem key={sub.title}>
              <SidebarMenuSubButton
                render={
                  <NavLink to={sub.url}>
                    {({ isActive, isPending }) => (
                      <>
                        {SubIcon && (
                          <SubIcon
                            className={isActive ? 'stroke-primary' : ''}
                          />
                        )}
                        <span className='truncate'>{sub.title}</span>
                        {isPending && (
                          <Loader2Icon className='ml-auto animate-spin' />
                        )}
                      </>
                    )}
                  </NavLink>
                }
              />
            </SidebarMenuSubItem>
          )
        })}
      </CollapsibleContent>
    </Collapsible>
  )
}
