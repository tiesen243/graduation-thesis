import { Tabs, TabsList, TabsTrigger } from '@rozumari/ui/components/tabs'
import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'
import { DeviceInfo } from '@/routes/dashboard/pill-boxes/_components/device-info'
import { ActivityTab } from '@/routes/dashboard/pill-boxes/_components/tabs/activity'
import { OverviewTab } from '@/routes/dashboard/pill-boxes/_components/tabs/overview'
import { SettingsTab } from '@/routes/dashboard/pill-boxes/_components/tabs/settings'

import type { Route } from './+types/[id]'

export default function DevicesShowPage({
  params: { id },
}: Route.ComponentProps) {
  const { data } = useQuery(
    api.device.show.queryOptions({ params: { id } as never })
  )
  if (!data?.data) return null

  const device = data.data

  return (
    <>
      <DeviceInfo device={device} />

      <Tabs defaultValue='overview' className='mt-7'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='activity'>Activity log</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <OverviewTab device={device} />

        <ActivityTab />

        <SettingsTab />
      </Tabs>
    </>
  )
}
