import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'
import type { ScrollViewInstance } from 'react-native'

import { Badge } from '@rozumari/ui/components/badge'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

import { ActivityIndicator, RefreshControl } from '@/components/native'
import { ScheduleCard } from '@/components/schedule/schedule-card'
import { getTimezonedDate } from '@/lib/utils'

const [today] = getTimezonedDate().toISOString().split('T')

export interface ScheduleListRef {
  scrollToDate: (date: string) => void
}

export const ScheduleList = React.forwardRef<
  ScheduleListRef,
  {
    schedules: ListSchedulesDto.Output
    isLoading: boolean
    refetch: () => Promise<unknown>
    isRefetching: boolean
  }
>(({ schedules, isLoading, refetch, isRefetching }, ref) => {
  const { t } = useTranslation('schedule')

  const scheduleScrollRef = React.useRef<ScrollViewInstance>(null)
  const groupPositions = React.useRef<Record<string, number>>({})

  const groupedSchedules = React.useMemo(() => {
    const grouped: Record<string, typeof schedules> = {}

    for (const schedule of schedules) {
      if (!grouped[schedule.date]) grouped[schedule.date] = []
      grouped[schedule.date] = [...(grouped[schedule.date] ?? []), schedule]
    }

    return grouped
  }, [schedules])

  React.useImperativeHandle(ref, () => ({
    scrollToDate(date) {
      const y = groupPositions.current[date]

      if (y === undefined) return

      scheduleScrollRef.current?.scrollTo({
        y,
        animated: true,
      })
    },
  }))

  if (isLoading)
    return (
      <ScrollView
        contentContainerClassName='flex-grow items-center justify-center'
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch as never}
          />
        }
      >
        <ActivityIndicator size='large' />
      </ScrollView>
    )

  if (!isLoading && schedules.length === 0)
    return (
      <ScrollView
        contentContainerClassName='flex-grow items-center justify-center'
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch as never}
          />
        }
      >
        <Typography className='text-muted-foreground'>
          {t('index.no_schedules')}
        </Typography>
      </ScrollView>
    )

  return (
    <ScrollView
      ref={scheduleScrollRef}
      contentContainerClassName='grow gap-3 pb-4'
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch as never}
        />
      }
    >
      {Object.entries(groupedSchedules).map(([date, group]) => {
        const isToday = date === today

        return (
          <View
            key={date}
            onLayout={(event) => {
              groupPositions.current[date] = event.nativeEvent.layout.y
            }}
          >
            <View className='mb-3 flex-row items-center'>
              <View
                className={cn('h-px w-4', isToday ? 'bg-primary' : 'bg-border')}
              />

              <Badge
                variant={isToday ? 'default' : 'secondary'}
                className='rounded-md'
              >
                <Typography>
                  {isToday ? t('index.label', { date }) : date}
                </Typography>
              </Badge>
            </View>

            <View className='flex-col gap-3 px-4'>
              {group.map((schedule) => (
                <ScheduleCard key={schedule.id} schedule={schedule} />
              ))}
            </View>
          </View>
        )
      })}
    </ScrollView>
  )
})
ScheduleList.displayName = 'ScheduleList'
