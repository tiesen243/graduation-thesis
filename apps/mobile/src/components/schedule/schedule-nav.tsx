import { getCurrentWeekRange } from '@rozumari/lib/get-current-week-range'
import { Button } from '@rozumari/ui/components/button'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useMemo } from 'react'
import { View } from 'react-native'

const getAdjacentWeekRange = (currentStartDate: string, offsetDays: number) => {
  const date = new Date(currentStartDate)
  date.setDate(date.getDate() + offsetDays)
  return getCurrentWeekRange(date)
}

const STATUSES = [
  { label: 'Completed', color: 'bg-success' },
  { label: 'Pending', color: 'bg-warning' },
  { label: 'Missed', color: 'bg-destructive' },
]

export const ScheduleNav: React.FC<{
  startDate: string
  endDate: string
  setWeek: (options: { startDate: string; endDate: string }) => void
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
    <View className='flex-row items-center justify-between gap-4 px-4'>
      <View className='flex-row items-center gap-3'>
        {STATUSES.map((status) => (
          <View key={status.label} className='flex-row items-center gap-1.5'>
            <View className={cn('size-2 rounded-full', status.color)} />
            <Typography className='text-xs'>{status.label}</Typography>
          </View>
        ))}
      </View>

      <View className='flex-row items-center rounded-lg border border-border'>
        <Button
          variant='outline'
          size='icon'
          className='rounded-r-none border-r border-none'
          onPress={() => setWeek(getAdjacentWeekRange(startDate, -7))}
        >
          <ChevronLeftIcon className='size-5 text-foreground' />
        </Button>
        <Button
          variant='outline'
          className='rounded-none border-none'
          onPress={() => setWeek(getCurrentWeekRange())}
        >
          <Typography>{formattedRange}</Typography>
        </Button>
        <Button
          variant='outline'
          size='icon'
          className='rounded-l-none border-l border-none'
          onPress={() => setWeek(getAdjacentWeekRange(startDate, 7))}
        >
          <ChevronRightIcon className='size-5 text-foreground' />
        </Button>
      </View>
    </View>
  )
}
