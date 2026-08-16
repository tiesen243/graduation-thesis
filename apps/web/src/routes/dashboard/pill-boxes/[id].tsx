import { Tabs, TabsList, TabsTrigger } from '@rozumari/ui/components/tabs'

import { DeviceInfo } from '@/routes/dashboard/pill-boxes/_components/device-info'
import { ActivityTab } from '@/routes/dashboard/pill-boxes/_components/tabs/activity'
import { OverviewTab } from '@/routes/dashboard/pill-boxes/_components/tabs/overview'
import { SettingsTab } from '@/routes/dashboard/pill-boxes/_components/tabs/settings'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

import type { Route } from './+types/[id]'

export default function DevicesShowPage(_: Route.ComponentProps) {
  const { isLoading } = useDevice()
  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <DeviceInfo />

      <Tabs defaultValue='overview' className='mt-7'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='activity'>Activity log</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>

        <OverviewTab />

        <ActivityTab />

        <SettingsTab />
      </Tabs>
    </>
  )
}
