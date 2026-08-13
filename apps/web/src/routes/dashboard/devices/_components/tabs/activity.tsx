import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { TabsContent } from '@rozumari/ui/components/tabs'
import { Typography } from '@rozumari/ui/components/typography'

export const ActivityTab: React.FC = () => (
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
