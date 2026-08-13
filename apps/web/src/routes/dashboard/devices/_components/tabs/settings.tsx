import { Button } from '@rozumari/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { ChevronDownIcon } from '@rozumari/ui/components/icons'
import { TabsContent } from '@rozumari/ui/components/tabs'

export const SettingsTab: React.FC = () => (
  <TabsContent value='settings'>
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle>Device settings</CardTitle>
        <CardDescription>
          Manage schedules, alerts, and connectivity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant='outline'>
          <ChevronDownIcon data-icon='inline-start' /> Open configuration
        </Button>
      </CardContent>
    </Card>
  </TabsContent>
)
