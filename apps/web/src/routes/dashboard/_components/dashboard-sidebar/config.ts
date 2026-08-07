import type { LucideIcon } from '@rozumari/ui/components/icons'

import {
  ActivityIcon,
  BellIcon,
  CalendarClockIcon,
  CreditCardIcon,
  FileTextIcon,
  Grid3x3Icon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  PillBottleIcon,
  PillIcon,
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
  badge?: string
  items?: NavSubItem[]
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
      { title: 'Patients', icon: UsersIcon, url: '/patients', badge: '8' },
      { title: 'Adherence', icon: ActivityIcon, url: '/adherence' },
    ],
  },
  {
    label: 'Devices',
    items: [
      {
        title: 'Pill Boxes',
        icon: PillIcon,
        items: [
          { title: 'All Devices', icon: PillBottleIcon, url: '/devices' },
          { title: 'Compartments', icon: Grid3x3Icon, url: '/compartments' },
          { title: 'Refills', icon: PillIcon, url: '/refills' },
        ],
      },
      {
        title: 'Schedules',
        icon: CalendarClockIcon,
        url: '/schedules',
        badge: '24',
      },
    ],
  },
  {
    label: 'Billing',
    items: [
      { title: 'Subscriptions', icon: CreditCardIcon, url: '/subscriptions' },
      { title: 'Invoices', icon: FileTextIcon, url: '/invoices' },
      { title: 'Transactions', icon: ReceiptIcon, url: '/transactions' },
    ],
  },
]

export const secondaryNavItems: NavItem[] = [
  { title: 'Notifications', icon: BellIcon, url: '/notifications', badge: '3' },
  { title: 'Settings', icon: SettingsIcon, url: '/settings' },
  { title: 'Support', icon: LifeBuoyIcon, url: '/support' },
]
