import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { Card, CardHeader } from '@rozumari/ui/components/card'
import {
  ClockIcon,
  HardDriveIcon,
  PillIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { View } from 'react-native'

const STATUS_CONFIG = {
  completed: {
    variant: 'success' as const,
    borderClass: 'border-l-success',
  },
  pending: {
    variant: 'outline' as const,
    borderClass: 'border-l-warning',
  },
  failed: {
    variant: 'destructive' as const,
    borderClass: 'border-l-destructive',
  },
} as const

export const ScheduleCard: React.FC<{
  schedule: ListSchedulesDto.Output[number]
}> = ({ schedule }) => {
  const statusConfig =
    STATUS_CONFIG[schedule.status as keyof typeof STATUS_CONFIG]

  return (
    <Card
      key={schedule.id}
      className={cn('border-l-2', statusConfig.borderClass)}
    >
      <CardHeader className='flex-row flex-wrap items-center gap-3'>
        <View className='flex-row items-center gap-1.5'>
          <ClockIcon className='size-4 text-muted-foreground' />
          <Typography className='text-base font-bold'>
            {schedule.time}
          </Typography>
        </View>

        {schedule.device && (
          <Badge variant='secondary'>
            <HardDriveIcon className='size-3 text-secondary-foreground' />
            <Typography>
              {schedule.device.name}
              {schedule.device.position && ` (${schedule.device.position})`}
            </Typography>
          </Badge>
        )}
      </CardHeader>

      <View className='block divide-y divide-border/50 rounded-lg px-4'>
        {schedule.items.map((item) => (
          <View
            key={`${schedule.id}-slot-${item.slot}`}
            className='flex-row flex-wrap items-center justify-between gap-4 bg-muted/40 p-2 text-sm'
          >
            <View className='flex-row items-center gap-2'>
              <PillIcon className='size-3.5 shrink-0 text-primary' />
              <Typography className='font-medium'>{item.medicine}</Typography>
              {item.dosage && (
                <Typography className='text-xs text-muted-foreground'>
                  ({item.dosage})
                </Typography>
              )}
            </View>

            <Badge variant='outline'>
              <Typography>
                Slot {item.slot} • Quantity: {item.quantity}
              </Typography>
            </Badge>
          </View>
        ))}
      </View>
    </Card>
  )
}
