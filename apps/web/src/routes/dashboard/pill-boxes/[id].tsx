import { Tabs, TabsList, TabsTrigger } from '@rozumari/ui/components/tabs'

import { DeviceInfo } from '@/routes/dashboard/pill-boxes/_components/device-info'
import { ActivityTab } from '@/routes/dashboard/pill-boxes/_components/tabs/activity'
import { OverviewTab } from '@/routes/dashboard/pill-boxes/_components/tabs/overview'
import { SchedulesTab } from '@/routes/dashboard/pill-boxes/_components/tabs/schedules'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

export default function DevicesShowPage() {
  const { isLoading } = useDevice()
  if (isLoading) return <div>Loading...</div>

  return (
    <>
      <DeviceInfo />

      <Tabs defaultValue='overview' className='mt-7'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='activity'>Activity log</TabsTrigger>
          <TabsTrigger value='schedules'>Schedules</TabsTrigger>
        </TabsList>

        <OverviewTab />

        <ActivityTab />

        <SchedulesTab />
      </Tabs>
    </>
  )
}
