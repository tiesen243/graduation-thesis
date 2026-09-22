import type { ListNotificationsDto } from '@rozumari/contract/notification/dto/list-notifications.dto'
import type { InfiniteData } from '@tanstack/react-query'

import { Badge } from '@rozumari/ui/components/badge'
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { Typography } from '@rozumari/ui/components/typography'
import { cn, formatDate, formatDistanceDays } from '@rozumari/ui/lib/utils'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, TouchableOpacity, View } from 'react-native'

import { ActivityIndicator, RefreshControl } from '@/components/native'
import { useRuntime } from '@/hooks/use-runtime'
import { getTimezonedDate } from '@/lib/utils'

export const LEVEL_CONFIG = {
  info: { key: 'level.info', variant: 'info' },
  warning: { key: 'level.warning', variant: 'warning' },
  error: { key: 'level.error', variant: 'destructive' },
} as const

type NotificationItem = ListNotificationsDto.Output['notifications'][number]

interface NotificationSection {
  title: string
  data: NotificationItem[]
}

export default function TabsNotificationsIndexScreen() {
  const { t, i18n } = useTranslation('notification')

  const queryClient = useQueryClient()
  const { api } = useRuntime()
  const router = useRouter()

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

  const sections = useMemo(() => {
    const notifications =
      data?.pages.flatMap((page) => page.data.notifications) ?? []

    const groups: Record<string, NotificationItem[]> = {}

    for (const notification of notifications) {
      const groupTitle = formatDistanceDays(notification.createdAt, {
        earlierDate: getTimezonedDate(),
        locale: i18n.language,
      })

      if (!groups[groupTitle]) groups[groupTitle] = []
      groups[groupTitle].push(notification)
    }

    return Object.entries(groups).map(([title, d]) => ({ title, data: d }))
  }, [data?.pages, i18n.language])

  const handleRefresh = useCallback(async () => {
    queryClient.setQueryData(
      api.notification.list.getQueryKey({ query: {} }),
      (oldData: InfiniteData<unknown, unknown>) => {
        if (!oldData) return oldData
        return {
          pages: oldData.pages.slice(0, 1),
          pageParams: oldData.pageParams.slice(0, 1),
        }
      }
    )

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: api.notification.unread.getQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: api.notification.list.getQueryKey({ query: {} }),
      }),
    ])
  }, [api.notification.unread, api.notification.list, queryClient])

  return (
    <SectionList<NotificationItem, NotificationSection>
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerClassName='p-4 pb-0 gap-4'
      renderSectionHeader={({ section: { title } }) => (
        <Typography
          className={cn(
            'text-sm font-semibold text-muted-foreground capitalize',
            sections[0]?.title !== title && '-mt-4'
          )}
        >
          {title}
        </Typography>
      )}
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
                  <Typography>{t(levelConfig.key)}</Typography>
                </Badge>

                <CardDescription className='text-xs text-muted-foreground'>
                  {formatDate(item.createdAt, { mode: 'time' })}
                </CardDescription>
              </View>

              <CardTitle numberOfLines={1}>{item.title}</CardTitle>

              <CardDescription numberOfLines={2}>{item.body}</CardDescription>
            </CardHeader>
          </TouchableOpacity>
        )
      }}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
      }
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage()
      }}
      onEndReachedThreshold={0.05}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : <View />
      }
    />
  )
}
