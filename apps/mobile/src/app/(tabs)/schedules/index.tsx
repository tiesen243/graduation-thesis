import { getCurrentWeekRange } from '@rozumari/lib/get-current-week-range'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { View } from 'react-native'

import type { ScheduleListRef } from '@/components/schedule/schedule-list'

import { ScheduleDatePager } from '@/components/schedule/schedule-date-pager'
import { ScheduleList } from '@/components/schedule/schedule-list'
import { ScheduleNav } from '@/components/schedule/schedule-nav'
import { useRuntime } from '@/hooks/use-runtime'
import { getTimezonedDate } from '@/lib/utils'

const { startDate, endDate } = getCurrentWeekRange(getTimezonedDate())

export default function TabsSchedulesIndexScreen() {
  const [query, setQuery] = useState({ startDate, endDate })
  const { api } = useRuntime()

  const { data, isLoading, refetch, isRefetching } = useQuery(
    api.schedule.list.queryOptions({ query })
  )

  const scheduleListRef = useRef<ScheduleListRef>(null)

  return (
    <View className='flex-1'>
      <ScheduleNav
        startDate={query.startDate}
        endDate={query.endDate}
        setWeek={setQuery}
      />

      <ScheduleDatePager
        startDate={query.startDate}
        endDate={query.endDate}
        onDatePress={(date) => scheduleListRef.current?.scrollToDate(date)}
        onWeekChange={setQuery}
      />

      <ScheduleList
        ref={scheduleListRef}
        schedules={data?.data ?? []}
        isLoading={isLoading}
        refetch={refetch}
        isRefetching={isRefetching}
      />
    </View>
  )
}
