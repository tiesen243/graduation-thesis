import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { getCurrentWeekRange } from '@rozumari/lib/get-current-week-range'
import { Button } from '@rozumari/ui/components/button'
import { ButtonGroup } from '@rozumari/ui/components/button-group'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@rozumari/ui/components/icons'
import { cn } from '@rozumari/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { useDate } from '@/hooks/use-date'
import { api } from '@/lib/runtime'

const STATUSES = [
  { label: 'Completed', color: 'bg-success' },
  { label: 'Pending', color: 'bg-warning' },
  { label: 'Missed', color: 'bg-destructive' },
]

const getAdjacentWeekRange = (currentStartDate: string, offsetDays: number) => {
  const date = new Date(currentStartDate)
  date.setDate(date.getDate() + offsetDays)
  return getCurrentWeekRange(date)
}

export const ScheduleNav: React.FC<{
  startDate: string
  endDate: string
  setWeek: (week: { startDate: string; endDate: string }) => void
  deviceId?: DeviceId
}> = ({ startDate, endDate, setWeek, deviceId }) => {
  const today = useDate()

  const formattedRange = useMemo(() => {
    if (!startDate || !endDate) return ''
    const start = new Date(startDate)
    const end = new Date(endDate)

    const startStr = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const endStr = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return `${startStr} – ${endStr}`
  }, [startDate, endDate])

  const syncSchedule = useMutation({
    ...api.device.emit.mutationOptions({
      params: { id: deviceId as DeviceId },
    }),
  })

  return (
    <nav className='mt-4 flex flex-wrap items-center gap-4'>
      <div className='order-1 flex flex-1 items-center gap-3 text-xs text-muted-foreground'>
        {STATUSES.map((status) => (
          <span key={status.label} className='flex items-center gap-1.5'>
            <span className={cn('size-2 rounded-full', status.color)} />
            {status.label}
          </span>
        ))}
      </div>

      <ButtonGroup className='order-2 sm:order-3'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => setWeek(getAdjacentWeekRange(startDate, -7))}
        >
          <ChevronLeftIcon />
          <span className='sr-only'>Previous week</span>
        </Button>

        <Button
          variant='outline'
          onClick={() =>
            setWeek(getCurrentWeekRange(new Date(today ?? Date.now())))
          }
        >
          {formattedRange}
        </Button>

        <Button
          variant='outline'
          size='icon'
          onClick={() => setWeek(getAdjacentWeekRange(startDate, 7))}
        >
          <ChevronRightIcon />
          <span className='sr-only'>Next week</span>
        </Button>
      </ButtonGroup>

      <ButtonGroup className='order-3 sm:order-2'>
        <Button
          nativeButton={false}
          render={<Link to={`/dashboard/schedules/create?id=${deviceId}`} />}
        >
          Create
        </Button>

        {deviceId && (
          <Button
            onClick={() =>
              syncSchedule.mutate({ action: 'sync_schedule', payload: {} })
            }
            disabled={syncSchedule.isPending}
          >
            Sync
          </Button>
        )}
      </ButtonGroup>
    </nav>
  )
}
