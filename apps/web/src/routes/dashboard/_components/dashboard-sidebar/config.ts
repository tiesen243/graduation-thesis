import type { LucideIcon } from '@rozumari/ui/components/icons'

import {
  ActivityIcon,
  BellIcon,
  CalendarClockIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PillBottleIcon,
  ReceiptIcon,
  UsersIcon,
} from '@rozumari/ui/components/icons'

export interface NavSubItem {
  title: string
  url: string
  icon?: LucideIcon
}

export interface NavItem {
  title: string
  url?: string
  icon: LucideIcon
  items?: NavSubItem[]
  isAdminOnly?: boolean
}

export interface NavGroupConfig {
  label?: string
  items: NavItem[]
}

export const navGroups: NavGroupConfig[] = [
  {
    label: 'Overview',
    items: [
      { title: 'Dashboard', icon: LayoutDashboardIcon, url: '/dashboard' },
      {
        title: 'Adherence',
        icon: ActivityIcon,
        url: '/dashboard/adherence',
        isAdminOnly: true,
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        title: 'Pill Boxes',
        icon: PillBottleIcon,
        url: '/dashboard/pill-boxes',
      },
      {
        title: 'Users',
        icon: UsersIcon,
        url: '/dashboard/users',
        isAdminOnly: true,
      },
      {
        title: 'Schedules',
        icon: CalendarClockIcon,
        url: '/dashboard/schedules',
      },
    ],
  },
  {
    label: 'Billing',
    items: [
      {
        title: 'Subscriptions',
        icon: CreditCardIcon,
        url: '/dashboard/subscriptions',
        isAdminOnly: true,
      },
      {
        title: 'Invoices',
        icon: FileTextIcon,
        url: '/dashboard/invoices',
        isAdminOnly: true,
      },
      {
        title: 'Transactions',
        icon: ReceiptIcon,
        url: '/dashboard/transactions',
        isAdminOnly: true,
      },
    ],
  },
]

export const secondaryNavItems: NavItem[] = [
  { title: 'Notifications', icon: BellIcon, url: '/dashboard/notifications' },
]
