import { Button } from '@rozumari/ui/components/button'
import { TabsContent } from '@rozumari/ui/components/tabs'
import { useInfiniteQuery } from '@tanstack/react-query'

import { api } from '@/lib/runtime'
import { NotificationList } from '@/routes/dashboard/_components/notification-list'
import { useDevice } from '@/routes/dashboard/pill-boxes/_hooks/use-device'

export const NotificationsTab: React.FC = () => {
  const { device } = useDevice()

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: api.notification.list.getQueryKey({
        query: { deviceId: device?.id },
      }),
      initialPageParam: 1,
      queryFn: ({ pageParam = 1 }) =>
        api.notification.list.query({
          query: { deviceId: device?.id, page: pageParam },
        }),
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.data.meta
        return page < totalPages ? page + 1 : undefined
      },
      refetchInterval: 1000 * 30, // 30 seconds
      enabled: !!device?.id,
    })

  return (
    <TabsContent value='notifications'>
      <NotificationList notifications={data?.pages ?? []} />

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
    </TabsContent>
  )
}
