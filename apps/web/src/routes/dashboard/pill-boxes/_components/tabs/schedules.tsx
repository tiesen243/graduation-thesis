import { TabsContent } from '@rozumari/ui/components/tabs'

import { Schedules } from '@/routes/dashboard/_components/schedule'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

export const SchedulesTab: React.FC = () => {
  const { device } = useDevice()
  if (!device) return null

  return (
    <TabsContent value='schedules'>
      <Schedules deviceId={device.id} />
    </TabsContent>
  )
}
