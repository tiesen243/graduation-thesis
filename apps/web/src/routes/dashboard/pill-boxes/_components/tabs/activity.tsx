import { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { TabsContent } from '@rozumari/ui/components/tabs'
import { Typography } from '@rozumari/ui/components/typography'
import { useSubscription } from '@tiesen/effect-tanstack-query/react'

import { api } from '@/lib/runtime'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

export const ActivityTab: React.FC = () => {
  const { device } = useDevice()

  useSubscription(
    api.device.subscribe.subscriptionOptions(
      { params: { id: device?.id ?? DeviceId.make('') } },
      {
        keepAlive: { timeout: '30 seconds' },
        onData: (message) => {
          console.log('Received message:', message)
        },
        onError: (_error) => {
          console.error('Subscription error:', _error)
        },
      }
    )
  )

  return (
    <TabsContent value='activity'>
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Delivery and device events will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Typography className='text-muted-foreground'>
            No new activity.
          </Typography>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
