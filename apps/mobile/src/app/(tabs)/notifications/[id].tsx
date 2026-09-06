import type { CountUnreadNotificationsDto } from '@rozumari/contract/notification/dto/count-unread-notifications.dto'
import type { ListNotificationsDto } from '@rozumari/contract/notification/dto/list-notifications.dto'
import type { NotificationId } from '@rozumari/contract/notification/schemas/notification.schema'
import type { InfiniteData } from '@tanstack/react-query'

import { Badge } from '@rozumari/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

const LEVEL_CONFIG = {
  info: { label: 'Information', variant: 'info' },
  warning: { label: 'Warning', variant: 'warning' },
  error: { label: 'Error', variant: 'destructive' },
} as const

export default function TabsNotificationsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: NotificationId }>()
  const queryClient = useQueryClient()

  const { api } = useRuntime()
  const { data: response, isLoading } = useQuery(
    api.notification.show.queryOptions({ params: { id } })
  )

  const notification = response?.data

  useEffect(() => {
    if (notification?.readAt !== null) return

    void (() => {
      queryClient.setQueriesData(
        { queryKey: api.notification.unread.getQueryKey() },
        (oldData: CountUnreadNotificationsDto) =>
          oldData.data
            ? {
                ...oldData,
                data: {
                  ...oldData.data,
                  count: Math.max(oldData.data.count - 1, 0),
                },
              }
            : oldData
      )

      queryClient.setQueryData(
        api.notification.show.getQueryKey({ params: { id: notification.id } }),
        (oldData: NonNullable<typeof response>) =>
          oldData.data
            ? { ...oldData, data: { ...oldData?.data, readAt: new Date() } }
            : oldData
      )

      queryClient.setQueriesData<InfiniteData<ListNotificationsDto>>(
        { queryKey: api.notification.list.getQueryKey(), exact: false },
        (oldData) => {
          if (!oldData?.pages) return oldData
          const readAt = new Date()

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                notifications: page.data.notifications.map((n) =>
                  n.id === notification.id ? { ...n, readAt } : n
                ),
              },
            })),
          }
        }
      )
    })()
  }, [
    notification?.id,
    notification?.readAt,
    api.notification.list,
    api.notification.show,
    api.notification.unread,
    queryClient,
  ])

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <ActivityIndicator size='large' />
      </View>
    )
  }

  if (!notification) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Typography className='text-muted-foreground'>
          Notification not found.
        </Typography>
      </View>
    )
  }

  const levelConfig =
    LEVEL_CONFIG[notification.level as keyof typeof LEVEL_CONFIG]
  const formattedDate = Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(notification.createdAt)

  return (
    <ScrollView className='flex-1 p-4' contentContainerClassName='gap-4'>
      <View className='flex-row items-center justify-between'>
        <Badge variant={levelConfig.variant}>
          <Typography>{levelConfig.label}</Typography>
        </Badge>

        <Typography className='text-xs text-muted-foreground'>
          {formattedDate}
        </Typography>
      </View>

      <Typography className='text-xl font-bold text-foreground'>
        {notification.title}
      </Typography>

      <Card>
        <CardContent>
          <Typography>{notification.body}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Details</CardTitle>
        </CardHeader>

        <CardContent>
          {notification.deviceId && (
            <View className='flex-row justify-between'>
              <CardDescription>Device ID</CardDescription>
              <Typography className='text-sm' selectable>
                {notification.deviceId}
              </Typography>
            </View>
          )}

          {notification.scheduleId && (
            <View className='flex-row justify-between'>
              <CardDescription>Schedule ID</CardDescription>
              <Typography className='text-sm' selectable>
                {notification.scheduleId}
              </Typography>
            </View>
          )}
        </CardContent>
      </Card>

      {notification.payload && Object.keys(notification.payload).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payload Metadata</CardTitle>
          </CardHeader>

          <CardContent>
            <View className='gap-2 rounded-lg bg-muted/50 p-3'>
              {Object.entries(notification.payload).map(([key, value]) => (
                <View key={key} className='flex-row justify-between gap-4'>
                  <Typography className='text-xs font-semibold text-muted-foreground'>
                    {key}:
                  </Typography>

                  <Typography
                    className='flex-1 text-right text-xs text-foreground'
                    selectable
                  >
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </Typography>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>
      )}
    </ScrollView>
  )
}
