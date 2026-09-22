import { Tabs, TabsList, TabsTrigger } from '@rozumari/ui/components/tabs'
import { parseAsStringLiteral, useQueryState } from 'nuqs'

import { createMetadata } from '@/lib/metadata'
import { DevicesShowPageSkeleton } from '@/routes/dashboard/pill-boxes/[id].skeleton'
import { DeviceInfo } from '@/routes/dashboard/pill-boxes/_components/device-info'
import { NotificationsTab } from '@/routes/dashboard/pill-boxes/_components/tabs/notifications'
import { OverviewTab } from '@/routes/dashboard/pill-boxes/_components/tabs/overview'
import { SchedulesTab } from '@/routes/dashboard/pill-boxes/_components/tabs/schedules'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

import type { Route } from './+types/[id]'

export const meta: Route.MetaFunction = ({ params }) =>
  createMetadata({
    title: `Pill Box - ${params.id}`,
    description: `View and manage pill box ${params.id} details, notifications, and schedules.`,
  })

export default function DevicesShowPage() {
  const { isLoading } = useDevice()
  const [tab, setTab] = useQueryState(
    'tab',
    parseAsStringLiteral([
      'overview',
      'notifications',
      'schedules',
    ]).withDefault('overview')
  )

  if (isLoading) return <DevicesShowPageSkeleton />

  return (
    <>
      <h2 className='sr-only'>Device details</h2>

      <DeviceInfo />

      <Tabs defaultValue={tab} onValueChange={setTab as never} className='mt-7'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='schedules'>Schedules</TabsTrigger>
        </TabsList>

        <OverviewTab />

        <NotificationsTab />

        <SchedulesTab />
      </Tabs>
    </>
  )
}
