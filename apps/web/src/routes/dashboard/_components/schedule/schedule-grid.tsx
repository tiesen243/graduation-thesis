import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { SunIcon, SunsetIcon, MoonIcon } from '@rozumari/ui/components/icons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@rozumari/ui/components/table'
import { cn } from '@rozumari/ui/lib/utils'
import { useMemo } from 'react'

import { useDateRange } from '@/routes/dashboard/_components/schedule/_use-date-range'
import { ScheduleCard } from '@/routes/dashboard/_components/schedule/schedule-card'

export const TIME_SLOTS = [
  {
    key: 'morning',
    label: 'Morning',
    period: '05:00 - 11:59',
    icon: SunIcon,
  },
  {
    key: 'afternoon',
    label: 'Afternoon',
    period: '12:00 - 17:59',
    icon: SunsetIcon,
  },
  {
    key: 'night',
    label: 'Night',
    period: '18:00 - 04:59',
    icon: MoonIcon,
  },
] as const

const getTimeSlotKey = (timeStr: string): 'morning' | 'afternoon' | 'night' => {
  const hour = Math.trunc(Number(timeStr.split(':')[0] ?? '0'))
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'night'
}

export const ScheduleGrid: React.FC<{
  schedules: ListSchedulesDto.Output
  startDate: string
  endDate: string
}> = ({ schedules, startDate, endDate }) => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const gridData = useMemo(() => {
    const map = new Map<
      string,
      Record<'morning' | 'afternoon' | 'night', ListSchedulesDto.Output>
    >()

    for (const schedule of schedules) {
      const existingDate = map.get(schedule.date) ?? {
        morning: [],
        afternoon: [],
        night: [],
      }

      const timeSlotKey = getTimeSlotKey(schedule.time)

      map.set(schedule.date, {
        ...existingDate,
        [timeSlotKey]: [...existingDate[timeSlotKey], schedule],
      })
    }

    return map
  }, [schedules])

  const dateRange = useDateRange(startDate, endDate)

  return (
    <section className='mt-4 hidden rounded-md border bg-card md:block'>
      <Table className='table-fixed border-collapse'>
        <TableHeader className='bg-muted/50'>
          <TableRow className='hover:bg-transparent [&>th]:w-80 [&>th]:border-r [&>th]:p-4 [&>th]:first:w-32 [&>th]:last:border-r-0'>
            <TableHead className='text-center'>Time / Date</TableHead>

            {dateRange.map(({ iso, weekday, dayNumber }) => (
              <TableHead
                key={iso}
                className={
                  iso === today ? 'bg-ring/10 font-bold text-ring' : ''
                }
              >
                <div className='flex flex-col items-center gap-1'>
                  <span className='text-xs text-muted-foreground uppercase'>
                    {weekday}
                  </span>
                  <span className='text-sm font-semibold'>{dayNumber}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {TIME_SLOTS.map((slot) => {
            const SlotIcon = slot.icon

            return (
              <TableRow key={slot.key} className='h-48 hover:bg-transparent'>
                <TableCell className='border-r border-border bg-muted/50 p-3 text-center'>
                  <div className='flex flex-col items-center justify-center gap-1.5'>
                    <SlotIcon className='size-6 text-primary' />
                    <span className='text-base font-semibold text-foreground'>
                      {slot.label}
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {slot.period}
                    </span>
                  </div>
                </TableCell>

                {dateRange.map(({ iso }) => {
                  const daySchedules = gridData.get(iso)?.[slot.key] ?? []
                  const isToday = iso === today

                  return (
                    <TableCell
                      key={`${iso}-${slot.key}`}
                      className={cn(
                        'space-y-2 border-r border-border p-2.5 align-top last:border-r-0',
                        isToday && 'bg-primary/5'
                      )}
                    >
                      {daySchedules.map((schedule) => (
                        <ScheduleCard
                          key={schedule.id}
                          schedule={schedule}
                          as='div'
                        />
                      ))}
                    </TableCell>
                  )
                })}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
