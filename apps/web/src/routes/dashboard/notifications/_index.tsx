import { Button } from '@rozumari/ui/components/button'
import { Typography } from '@rozumari/ui/components/typography'
import { useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'
import {
  NotificationList,
  NotificationListSkeleton,
} from '@/routes/dashboard/_components/notification-list'

export default function NotificationsPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: api.notification.list.getQueryKey({ query: {} }),
      initialPageParam: 1,
      queryFn: ({ pageParam = 1 }) =>
        api.notification.list.query({ query: { page: pageParam } }),
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.data.meta
        return page < totalPages ? page + 1 : undefined
      },
      refetchInterval: 1000 * 30, // 30 seconds
    })

  return (
    <>
      <Typography variant='h2'>Notifications</Typography>
      <Typography>
        Stay up to date with your medication schedule, refills, and care plan.
      </Typography>

      {isLoading ? (
        <NotificationListSkeleton />
      ) : (
        <NotificationList notifications={data?.pages ?? []} />
      )}

      {hasNextPage && (
        <Button
          className='mx-auto mt-2 block'
          variant='secondary'
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </Button>
      )}
    </>
  )
}
