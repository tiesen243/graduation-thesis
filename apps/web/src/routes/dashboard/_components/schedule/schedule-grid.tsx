import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { Card, CardContent, CardHeader } from '@rozumari/ui/components/card'
import {
  ClockIcon,
  HardDriveIcon,
  PillIcon,
} from '@rozumari/ui/components/icons'
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

import {
  STATUS_CONFIG,
  TIME_SLOTS,
  useDateRange,
} from '@/routes/dashboard/_components/schedule/_shared'

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
                      {daySchedules.map((schedule) => {
                        const statusConfig =
                          STATUS_CONFIG[
                            schedule.status as keyof typeof STATUS_CONFIG
                          ] ?? STATUS_CONFIG.pending

                        return (
                          <Card
                            key={schedule.id}
                            className={cn(
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
                                  {schedule.device.name}
                                  {schedule.device.position &&
                                    ` (${schedule.device.position})`}
                                </Badge>
                              )}
                            </CardHeader>

                            <CardContent className='mx-4 divide-y divide-border/50 rounded-lg bg-muted/40'>
                              {schedule.items.map((item) => (
                                <div
                                  key={`${schedule.id}-slot-${item.slot}`}
                                  className='flex flex-wrap items-center justify-between gap-4 py-2 text-sm'
                                >
                                  <div className='flex items-center gap-2'>
                                    <PillIcon className='h-4 w-4 shrink-0 text-primary' />
                                    <span className='font-medium'>
                                      {item.medicine}
                                    </span>
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
                            </CardContent>
                          </Card>
                        )
                      })}
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
