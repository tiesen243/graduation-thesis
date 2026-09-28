import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewInstance,
} from 'react-native'

import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useCallback, useMemo, useRef } from 'react'
import { Dimensions, Pressable, ScrollView, View } from 'react-native'

import { getAdjacentWeekRange } from '@/components/schedule/schedule-nav'
import { useDateRange } from '@/hooks/use-date-range'
import { getTimezonedDate } from '@/lib/utils'

const SCREEN_WIDTH = Dimensions.get('window').width
const DATE_ITEM_SIZE = SCREEN_WIDTH / 7 - 12

const [today] = getTimezonedDate().toISOString().split('T')

interface ScheduleDatePagerProps {
  startDate: string
  endDate: string
  onDatePress: (date: string) => void
  onWeekChange: (options: { startDate: string; endDate: string }) => void
}

export const ScheduleDatePager: React.FC<ScheduleDatePagerProps> = ({
  startDate,
  endDate,
  onDatePress,
  onWeekChange,
}) => {
  const pagerRef = useRef<ScrollViewInstance>(null)
  const changingWeekRef = useRef(false)

  const previousWeek = useMemo(
    () => getAdjacentWeekRange(startDate, -7),
    [startDate]
  )

  const nextWeek = useMemo(
    () => getAdjacentWeekRange(startDate, 7),
    [startDate]
  )

  const previousDateRange = useDateRange(
    previousWeek.startDate,
    previousWeek.endDate
  )

  const currentDateRange = useDateRange(startDate, endDate)

  const nextDateRange = useDateRange(nextWeek.startDate, nextWeek.endDate)

  const handlePagerBegin = useCallback(() => {
    changingWeekRef.current = false
  }, [])

  const handlePagerEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (changingWeekRef.current) return

      const { x } = event.nativeEvent.contentOffset
      const page = Math.round(x / SCREEN_WIDTH)

      if (page === 0) {
        changingWeekRef.current = true
        onWeekChange(previousWeek)

        requestAnimationFrame(() => {
          pagerRef.current?.scrollTo({
            x: SCREEN_WIDTH,
            animated: false,
          })
        })

        return
      }

      if (page === 2) {
        changingWeekRef.current = true
        onWeekChange(nextWeek)

        requestAnimationFrame(() => {
          pagerRef.current?.scrollTo({
            x: SCREEN_WIDTH,
            animated: false,
          })
        })
      }
    },
    [nextWeek, onWeekChange, previousWeek]
  )

  const renderDatePage = (
    dates: ReturnType<typeof useDateRange>,
    interactive = false
  ) => (
    <View
      style={{ width: SCREEN_WIDTH }}
      className='flex-row items-center justify-between gap-2 px-4'
    >
      {dates.map(({ iso, weekday, dayNumber }) => {
        const content = (
          <>
            <Typography className='text-sm text-muted-foreground'>
              {weekday}
            </Typography>

            <Typography
              className={cn(
                'font-medium',
                interactive && iso === today && 'text-ring'
              )}
            >
              {dayNumber}
            </Typography>
          </>
        )

        if (!interactive)
          return (
            <View
              key={iso}
              style={{ width: DATE_ITEM_SIZE, height: DATE_ITEM_SIZE }}
              className='items-center justify-center rounded-lg border border-border bg-card'
            >
              {content}
            </View>
          )

        return (
          <Pressable
            key={iso}
            onPress={() => onDatePress(iso)}
            style={{ width: DATE_ITEM_SIZE, height: DATE_ITEM_SIZE }}
            className={cn(
              'items-center justify-center rounded-lg border bg-card',
              iso === today ? 'border-ring bg-ring/10' : 'border-border'
            )}
          >
            {content}
          </Pressable>
        )
      })}
    </View>
  )

  return (
    <View className='h-20'>
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handlePagerBegin}
        onMomentumScrollEnd={handlePagerEnd}
        contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
      >
        {renderDatePage(previousDateRange)}
        {renderDatePage(currentDateRange, true)}
        {renderDatePage(nextDateRange)}
      </ScrollView>
    </View>
  )
}
