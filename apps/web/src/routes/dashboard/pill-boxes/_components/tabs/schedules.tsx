import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { TabsContent } from '@rozumari/ui/components/tabs'

export const SchedulesTab: React.FC = () => (
  <TabsContent value='schedules'>
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>Device schedules</CardTitle>
        <CardDescription>Manage schedules</CardDescription>
      </CardHeader>
    </Card>
  </TabsContent>
)
