import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import {
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  Empty,
} from '@rozumari/ui/components/empty'
import { CalendarSyncIcon } from '@rozumari/ui/components/icons'
import { useQuery } from '@tanstack/react-query'
import { parseAsString, useQueryStates } from 'nuqs'
import { Link } from 'react-router'

import { api } from '@/lib/runtime'
import { getCurrentWeekRange } from '@/lib/utils'
import { ScheduleGrid } from '@/routes/dashboard/_components/schedule/schedule-grid'
import { ScheduleList } from '@/routes/dashboard/_components/schedule/schedule-list'
import { ScheduleNav } from '@/routes/dashboard/_components/schedule/schedule-nav'
import { ScheduleSkeleton } from '@/routes/dashboard/_components/schedule/schedule-skeleton'

const { startDate, endDate } = getCurrentWeekRange()

export const Schedules: React.FC<{
  deviceId?: DeviceId
}> = ({ deviceId }) => {
  const [query, setQuery] = useQueryStates(
    {
      startDate: parseAsString.withDefault(startDate),
      endDate: parseAsString.withDefault(endDate),
    },
    { urlKeys: { startDate: 's', endDate: 'e' } }
  )

  const { data, isLoading } = useQuery(
    api.schedule.list.queryOptions({
      query: { ...query, deviceId },
    })
  )

  if (isLoading)
    return (
      <>
        <ScheduleNav
          startDate={query.startDate}
          endDate={query.endDate}
          setWeek={setQuery}
        />

        <ScheduleSkeleton />
      </>
    )

  return (
    <>
      <ScheduleNav
        startDate={query.startDate}
        endDate={query.endDate}
        setWeek={setQuery}
      />

      {data?.data.length === 0 ? (
        <Empty className='my-24'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <CalendarSyncIcon />
            </EmptyMedia>
            <EmptyTitle>No schedules found</EmptyTitle>
            <EmptyDescription>
              You have no schedules for the selected week. Please add a schedule
              to see it here.
            </EmptyDescription>

            <EmptyContent className='flex-row justify-center gap-2'>
              <Button
                nativeButton={false}
                render={<Link to='/dashboard/schedules/create' />}
              >
                Create Schedule
              </Button>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <ScheduleList
            schedules={data?.data ?? []}
            startDate={query.startDate}
            endDate={query.endDate}
          />

          <ScheduleGrid
            schedules={data?.data ?? []}
            startDate={query.startDate}
            endDate={query.endDate}
          />
        </>
      )}
    </>
  )
}
