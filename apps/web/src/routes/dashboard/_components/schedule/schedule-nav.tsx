import { Button } from '@rozumari/ui/components/button'
import { ButtonGroup } from '@rozumari/ui/components/button-group'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@rozumari/ui/components/icons'
import { useMemo } from 'react'
import { Link } from 'react-router'

import { getCurrentWeekRange } from '@/lib/utils'

const getAdjacentWeekRange = (currentStartDate: string, offsetDays: number) => {
  const date = new Date(currentStartDate)
  date.setDate(date.getDate() + offsetDays)
  return getCurrentWeekRange(date)
}

export const ScheduleNav: React.FC<{
  startDate: string
  endDate: string
  setWeek: (week: { startDate: string; endDate: string }) => void
}> = ({ startDate, endDate, setWeek }) => {
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

  return (
    <nav className='mt-4 flex flex-wrap items-center gap-4'>
      <div className='flex flex-1 items-center gap-3 text-xs text-muted-foreground'>
        <span className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-success' />
          Completed
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-warning' />
          Pending
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='size-2 rounded-full bg-destructive' />
          Missed
        </span>
      </div>

      <Button
        nativeButton={false}
        render={<Link to='/dashboard/schedules/create' />}
      >
        Create Schedule
      </Button>

      <ButtonGroup>
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
          onClick={() => setWeek(getCurrentWeekRange())}
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
    </nav>
  )
}
