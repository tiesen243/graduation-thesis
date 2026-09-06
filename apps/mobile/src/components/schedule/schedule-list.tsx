import type { ListSchedulesDto } from '@rozumari/contract/schedule/dto/list-schedules.dto'

import { Badge } from '@rozumari/ui/components/badge'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useCallback, useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native'

import { ScheduleCard } from '@/components/schedule/schedule-card'
import { useDateRange } from '@/hooks/use-date-range'

export const ScheduleList: React.FC<{
  schedules: ListSchedulesDto.Output
  startDate: string
  endDate: string

  isLoading: boolean

  refetch: () => Promise<unknown>
  isRefetching: boolean
}> = ({ schedules, startDate, endDate, ...props }) => {
  const { isLoading, refetch, isRefetching } = props

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const scrollViewRef = useRef<ScrollView>(null)
  const groupPositions = useRef<Record<string, number>>({})

  const groupedSchedules = useMemo(() => {
    const grouped: Record<string, typeof schedules> = {}

    for (const s of schedules) {
      if (!grouped[s.date]) grouped[s.date] = []
      grouped[s.date] = [...(grouped[s.date] ?? []), s]
    }

    return grouped
  }, [schedules])

  const dateRange = useDateRange(startDate, endDate)

  const handleScrollToDate = useCallback((isoDate: string) => {
    const yOffset = groupPositions.current[isoDate]
    if (yOffset !== undefined)
      scrollViewRef.current?.scrollTo({ y: yOffset, animated: true })
  }, [])

  return (
    <>
      <View className='w-full flex-row gap-2 p-4 pb-6'>
        {dateRange.map(({ iso, weekday, dayNumber }) => (
          <Pressable
            key={iso}
            onPress={() => handleScrollToDate(iso)}
            className={cn(
              'aspect-square min-w-0 flex-1 items-center justify-center rounded-lg border bg-card',
              iso === today ? 'border-ring bg-ring/10' : 'border-border'
            )}
          >
            <Typography className='text-sm text-muted-foreground'>
              {weekday}
            </Typography>
            <Typography
              className={cn('font-medium', iso === today && 'text-ring')}
            >
              {dayNumber}
            </Typography>
          </Pressable>
        ))}
      </View>

      {isLoading && (
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' colorClassName='accent-primary' />
        </View>
      )}

      {!isLoading && schedules.length <= 0 && (
        <View className='flex-1 items-center justify-center'>
          <Typography className='text-muted-foreground'>
            No schedules found. Please add a schedule to see it here.
          </Typography>
        </View>
      )}

      {!isLoading && schedules.length > 0 && (
        <ScrollView
          ref={scrollViewRef}
          className='flex-1'
          contentContainerClassName='gap-3'
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
        >
          {Object.entries(groupedSchedules).map(([date, group]) => {
            const isToday = date === today

            return (
              <View
                key={date}
                onLayout={(event) => {
                  const { y } = event.nativeEvent.layout
                  groupPositions.current[date] = y
                }}
              >
                <View className='mb-3 flex-row items-center'>
                  <View
                    className={cn(
                      'h-px w-4',
                      isToday ? 'bg-primary' : 'bg-border'
                    )}
                  />

                  <Badge
                    variant={isToday ? 'default' : 'secondary'}
                    className='rounded-md'
                  >
                    <Typography>
                      {isToday ? `Today (${date})` : date}
                    </Typography>
                  </Badge>
                </View>

                <View className='flex-col gap-3 px-4'>
                  {group?.map((schedule) => (
                    <ScheduleCard key={schedule.id} schedule={schedule} />
                  ))}
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
    </>
  )
}
