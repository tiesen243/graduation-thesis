import { getCurrentWeekRange } from '@rozumari/lib/get-current-week-range'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { ScheduleList } from '@/components/schedule/schedule-list'
import { ScheduleNav } from '@/components/schedule/schedule-nav'
import { useRuntime } from '@/hooks/use-runtime'
import { getTimezonedDate } from '@/lib/utils'

const { startDate, endDate } = getCurrentWeekRange(getTimezonedDate())

export default function TabsSchedulesIndexScreen() {
  const { api } = useRuntime()
  const [query, setQuery] = useState({ startDate, endDate })

  const { data, isLoading, refetch, isRefetching } = useQuery(
    api.schedule.list.queryOptions({ query })
  )

  return (
    <>
      <ScheduleNav
        startDate={query.startDate}
        endDate={query.endDate}
        setWeek={setQuery}
      />

      <ScheduleList
        startDate={query.startDate}
        endDate={query.endDate}
        schedules={data?.data ?? []}

        isLoading={isLoading}

        refetch={refetch}
        isRefetching={isRefetching}
      />
    </>
  )
}
