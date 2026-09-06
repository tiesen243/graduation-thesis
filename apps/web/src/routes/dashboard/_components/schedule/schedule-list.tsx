import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { cn } from '@rozumari/ui/lib/utils'
import { useCallback, useMemo } from 'react'

import { useDateRange } from '@/routes/dashboard/_components/schedule/_use-date-range'
import { ScheduleCard } from '@/routes/dashboard/_components/schedule/schedule-card'

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

      <nav className='sticky inset-16 z-40 -mx-4 bg-background px-4'>
        <ul className='flex gap-2 overflow-x-auto px-px py-4'>
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
                  'flex aspect-square min-w-20 flex-1 shrink-0 flex-col items-center justify-center gap-1 rounded-md ring-1 select-none',
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
      </nav>

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
              {group?.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} as='li' />
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}
