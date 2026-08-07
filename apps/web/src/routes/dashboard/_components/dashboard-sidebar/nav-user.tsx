import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@rozumari/ui/components/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rozumari/ui/components/dropdown-menu'
import {
  BadgeCheckIcon,
  BellIcon,
  ChevronsUpDownIcon,
  CreditCardIcon,
  LogOutIcon,
} from '@rozumari/ui/components/icons'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@rozumari/ui/components/sidebar'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'

export function NavUser() {
  const { isMobile } = useSidebar()
  const { data, isLoading } = useQuery(api.auth.whoami.queryOptions())

  if (isLoading || !data?.data) return null

  const user = data.data

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              />
            }
          >
            <Avatar className='size-8 rounded-lg'>
              <AvatarImage src={user.image ?? ''} alt={user.username} />
              <AvatarFallback className='rounded-lg'>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-semibold'>{user.username}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {user.email}
              </span>
            </div>
            <ChevronsUpDownIcon className='ml-auto size-4' />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={({ side }) => (side === 'bottom' ? 8 : 16)}
            align='end'
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                  <Avatar className='size-8 rounded-lg'>
                    <AvatarImage src={user.image ?? ''} alt={user.username} />
                    <AvatarFallback className='rounded-lg'>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {user.username}
                    </span>
                    <span className='truncate text-xs text-muted-foreground'>
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCardIcon />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
