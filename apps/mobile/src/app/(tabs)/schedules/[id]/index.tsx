import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import { Badge } from '@rozumari/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  AsteriskIcon,
  CalendarIcon,
  ClockIcon,
  CpuIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { formatDate } from '@rozumari/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

const STATUS_VARIANTS = {
  pending: 'warning',
  completed: 'success',
  failed: 'destructive',
} as const

export default function TabsSchedulesDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: ScheduleId }>()

  const { api } = useRuntime()
  const { data } = useQuery(api.schedule.show.queryOptions({ params: { id } }))

  if (!data?.data)
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' colorClassName='accent-primary' />
      </View>
    )

  const schedule = data.data
  const { device, items } = schedule

  return (
    <View className='gap-4 p-4'>
      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <CardTitle>Schedule Information</CardTitle>
          <Badge
            variant={
              STATUS_VARIANTS[schedule.status as keyof typeof STATUS_VARIANTS]
            }
          >
            <Typography>{schedule.status}</Typography>
          </Badge>
        </CardHeader>
        <CardContent className='gap-1'>
          <View className='flex-row items-center gap-2'>
            <CalendarIcon className='size-4 text-muted-foreground' />

            <Typography>
              {formatDate(schedule.date, 'eee, MMM d, yyyy')}
            </Typography>
          </View>
          <View className='flex-row items-center gap-2'>
            <ClockIcon className='size-4 text-muted-foreground' />
            <Typography>{schedule.time}</Typography>
          </View>
          <View className='flex-row items-center gap-2'>
            <CpuIcon className='size-4 text-muted-foreground' />
            <Typography>{device.name ?? device.id}</Typography>

            {device.position && (
              <Badge variant='outline'>
                <Typography>{data.data.device.position}</Typography>
              </Badge>
            )}
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Medication Items</CardTitle>
        </CardHeader>
        <CardContent className='gap-1'>
          {items.map((item) => (
            <Card key={item.slot} className='flex-row justify-between'>
              <CardHeader>
                <CardTitle>
                  {item.medicine}
                  {item.isRequired && (
                    <AsteriskIcon className='size-3 text-destructive' />
                  )}
                </CardTitle>
                <CardDescription>Slot: {item.slot}</CardDescription>
              </CardHeader>

              <CardContent>
                <CardDescription>Qty. {item.quantity}</CardDescription>
                <CardDescription>Dosage {item.dosage}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </View>
  )
}
