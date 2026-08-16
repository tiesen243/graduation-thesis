import type { LucideIcon } from '@rozumari/ui/components/icons'

import {
  ActivityIcon,
  BellIcon,
  CalendarClockIcon,
  CreditCardIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  PillBottleIcon,
  ReceiptIcon,
  SettingsIcon,
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
      { title: 'Patients', icon: UsersIcon, url: '/patients' },
      {
        title: 'Adherence',
        icon: ActivityIcon,
        url: '/adherence',
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
        url: '/pill-boxes',
      },
      {
        title: 'Users',
        icon: UsersIcon,
        url: '/users',
        isAdminOnly: true,
      },
      {
        title: 'Schedules',
        icon: CalendarClockIcon,
        url: '/schedules',
      },
    ],
  },
  {
    label: 'Billing',
    items: [
      {
        title: 'Subscriptions',
        icon: CreditCardIcon,
        url: '/subscriptions',
        isAdminOnly: true,
      },
      {
        title: 'Invoices',
        icon: FileTextIcon,
        url: '/invoices',
        isAdminOnly: true,
      },
      {
        title: 'Transactions',
        icon: ReceiptIcon,
        url: '/transactions',
        isAdminOnly: true,
      },
    ],
  },
]

export const secondaryNavItems: NavItem[] = [
  { title: 'Notifications', icon: BellIcon, url: '/notifications' },
  { title: 'Settings', icon: SettingsIcon, url: '/settings' },
  { title: 'Support', icon: LifeBuoyIcon, url: '/support' },
]
