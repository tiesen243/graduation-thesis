import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { CardHeader } from '@rozumari/ui/components/card'
import {
  ClockIcon,
  HardDriveIcon,
  PillIcon,
} from '@rozumari/ui/components/icons'
import { cn } from '@rozumari/ui/lib/utils'
import { Link } from 'react-router'

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
  as: 'li' | 'div'
  schedule: ListSchedulesDto.Output[number]
}> = ({ as: Comp, schedule }) => {
  const statusConfig =
    STATUS_CONFIG[schedule.status as keyof typeof STATUS_CONFIG]

  return (
    <Comp
      key={schedule.id}
      className={cn(
        'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
        'border-l-2',
        statusConfig.borderClass
      )}
    >
      <CardHeader className='flex flex-wrap items-center gap-3'>
        <span className='flex items-center gap-1.5 text-base font-bold'>
          <ClockIcon className='size-4 text-muted-foreground' />
          {schedule.time}
        </span>

        {schedule.device && (
          <Badge variant='secondary'>
            <HardDriveIcon className='size-3' />
            <Link to={`/dashboard/pill-boxes/${schedule.device.id}`}>
              {schedule.device.name}
              {schedule.device.position && ` (${schedule.device.position})`}
            </Link>
          </Badge>
        )}
      </CardHeader>

      <Link
        to={`/dashboard/schedules/${schedule.id}`}
        className='block divide-y divide-border/50 rounded-lg px-(--card-spacing)'
      >
        {schedule.items.map((item) => (
          <div
            key={`${schedule.id}-slot-${item.slot}`}
            className='flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-2 text-sm'
          >
            <div className='flex items-center gap-2'>
              <PillIcon className='size-3.5 shrink-0 text-primary' />
              <span className='font-medium'>{item.medicine}</span>
              {item.dosage && (
                <span className='text-xs text-muted-foreground'>
                  ({item.dosage})
                </span>
              )}
            </div>

            <Badge variant='outline'>
              Slot {item.slot} • Quantity: {item.quantity}
            </Badge>
          </div>
        ))}
      </Link>
    </Comp>
  )
}
