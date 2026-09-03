import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { CardContent, CardHeader } from '@rozumari/ui/components/card'
import {
  ClockIcon,
  HardDriveIcon,
  PillIcon,
} from '@rozumari/ui/components/icons'
import { cn } from '@rozumari/ui/lib/utils'
import { useCallback, useMemo } from 'react'

import {
  STATUS_CONFIG,
  useDateRange,
} from '@/routes/dashboard/_components/schedule/_shared'

export const ScheduleList: React.FC<{
  schedules: ListSchedulesDto.Output
  startDate: string
  endDate: string
}> = ({ schedules, startDate, endDate }) => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const groupedSchedules = useMemo(
    () => Object.groupBy(schedules, (s) => s.date),
    [schedules]
  )

  const dateRange = useDateRange(startDate, endDate)

  const scrollToDate = useCallback((dateStr: string) => {
    const targetElement = document.querySelector(`#schedule-${dateStr}`)
    if (targetElement)
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
  }, [])

  if (!schedules || schedules.length === 0)
    return (
      <div className='py-8 text-center text-muted-foreground'>
        No schedules found. Please add a schedule to see it here.
      </div>
    )

  return (
    <section className='flex flex-col md:hidden'>
      <h3 className='sr-only'>Schedule List section</h3>

      <ul className='sticky inset-16 z-40 -mx-4 grid grid-cols-7 gap-2 bg-background p-4 shadow-sm'>
        {dateRange.map(({ iso, weekday, dayNumber }) => {
          const isToday = iso === today

          return (
            // oxlint-disable-next-line jsx-a11y/click-events-have-key-events jsx-a11y/no-noninteractive-element-interactions
            <li
              key={iso}
              // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role jsx-a11y/no-noninteractive-element-to-interactive-role
              role='button'
              tabIndex={0}
              className={cn(
                'flex aspect-square flex-col items-center justify-center gap-1 rounded-md ring-1 select-none',
                isToday
                  ? 'bg-ring/10 text-ring ring-ring/50'
                  : 'cursor-pointer bg-card ring-foreground/10 transition-colors hover:bg-accent/50'
              )}
              aria-label={`Scroll to schedule for ${iso}`}

              onClick={() => scrollToDate(iso)}
            >
              <span className='text-xs text-muted-foreground uppercase'>
                {weekday}
              </span>
              <span className='text-sm font-semibold'>{dayNumber}</span>
            </li>
          )
        })}
      </ul>

      {Object.entries(groupedSchedules).map(([date, group], idx) => {
        const isToday = date === today

        return (
          <section
            key={date}
            id={`schedule-${date}`}
            className={cn(
              'scroll-mt-52 space-y-3',
              idx === 0 ? 'mt-2' : 'mt-6'
            )}
          >
            <div className='flex items-center'>
              <div
                className={cn('h-px w-4', isToday ? 'bg-primary' : 'bg-border')}
              />

              <Badge
                variant={isToday ? 'default' : 'secondary'}
                className='rounded-md px-2 py-1 text-sm font-medium'
                render={<h4>{isToday ? `Today (${date})` : date}</h4>}
              />
            </div>

            <ul className='grid gap-3'>
              {group?.map((schedule) => {
                const statusConfig =
                  STATUS_CONFIG[schedule.status as keyof typeof STATUS_CONFIG]

                return (
                  <li
                    key={schedule.id}
                    className={cn(
                      'group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
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
                    </CardContent>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
