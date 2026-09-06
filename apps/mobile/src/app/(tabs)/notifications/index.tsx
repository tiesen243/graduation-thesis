import { Badge } from '@rozumari/ui/components/badge'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

const LEVEL_CONFIG = {
  info: { label: 'Info', variant: 'info' },
  warning: { label: 'Warning', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
} as const

export default function TabsNotificationsIndexScreen() {
  const { api } = useRuntime()
  const router = useRouter()

  const queryClient = useQueryClient()

  const { data, isRefetching, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: api.notification.list.getQueryKey({ query: {} }),
      initialPageParam: 1,
      queryFn: ({ pageParam = 1 }) =>
        api.notification.list.query({ query: { page: pageParam } }),
      getNextPageParam: (lastPage) => {
        const { page, totalPages } = lastPage.data.meta
        return page < totalPages ? page + 1 : undefined
      },
    })

  const flattenDate = useMemo(
    () => data?.pages.flatMap((page) => page.data.notifications) ?? [],
    [data?.pages]
  )

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: api.notification.unread.getQueryKey(),
    })
    await queryClient.resetQueries({
      queryKey: api.notification.list.getQueryKey(),
      exact: false,
    })
  }, [api.notification.unread, api.notification.list, queryClient])

  return (
    <FlatList
      data={flattenDate}
      keyExtractor={(n) => n.id}
      contentContainerClassName='p-4 gap-4'
      renderItem={({ item }) => {
        const isUnread = !item.readAt
        const levelConfig =
          LEVEL_CONFIG[item.level as keyof typeof LEVEL_CONFIG]

        return (
          <TouchableOpacity
            data-slot='card'
            className={cn(
              'group/card flex flex-col gap-4 overflow-hidden rounded-xl bg-card py-4 ring-1 ring-foreground/10',
              isUnread ? 'bg-ring/20 ring-ring/40' : ''
            )}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/notifications/[id]',
                params: { id: item.id },
              })
            }
          >
            <CardHeader className='gap-2'>
              <View className='flex-row items-center justify-between gap-2'>
                <Badge variant={levelConfig.variant}>
                  <Typography>{levelConfig.label}</Typography>
                </Badge>

                <CardDescription className='text-xs text-muted-foreground'>
                  {Intl.DateTimeFormat('en', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: false,
                  }).format(new Date(item.createdAt))}
                </CardDescription>
              </View>

              <CardTitle numberOfLines={1}>{item.title}</CardTitle>

              <CardDescription numberOfLines={2}>{item.body}</CardDescription>
            </CardHeader>
          </TouchableOpacity>
        )
      }}

      refreshing={isRefetching}
      onRefresh={handleRefresh}

      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.05}

      ListFooterComponent={
        isFetchingNextPage ? (
          <View className='py-4'>
            <ActivityIndicator size='small' colorClassName='accent-primary' />
          </View>
        ) : null
      }
    />
  )
}
