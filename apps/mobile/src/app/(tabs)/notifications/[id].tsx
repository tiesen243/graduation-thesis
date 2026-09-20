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
import { formatDate } from '@rozumari/ui/lib/utils'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

import { ActivityIndicator } from '@/components/native'
import { useRuntime } from '@/hooks/use-runtime'
import { getTimezonedDate } from '@/lib/utils'

const LEVEL_CONFIG = {
  info: { labelKey: 'detail.level.info', variant: 'info' },
  warning: { labelKey: 'detail.level.warning', variant: 'warning' },
  error: { labelKey: 'detail.level.error', variant: 'destructive' },
} as const

export default function TabsNotificationsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: NotificationId }>()
  const { t, i18n } = useTranslation('notification')

  const queryClient = useQueryClient()
  const { api } = useRuntime()

  const { data: notification, isLoading } = useQuery({
    ...api.notification.show.queryOptions({ params: { id } }),
    select: (res) => res.data,
  })

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

      const readAt = getTimezonedDate()

      queryClient.setQueryData(
        api.notification.show.getQueryKey({ params: { id: notification.id } }),
        (oldData: { data: NonNullable<typeof notification> }) =>
          oldData.data
            ? { ...oldData, data: { ...oldData?.data, readAt } }
            : oldData
      )

      queryClient.setQueriesData<InfiniteData<ListNotificationsDto>>(
        { queryKey: api.notification.list.getQueryKey(), exact: false },
        (oldData) => {
          if (!oldData?.pages) return oldData

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

  if (isLoading)
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <ActivityIndicator size='large' />
      </View>
    )

  if (!notification)
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Typography className='text-muted-foreground'>
          {t('detail.not_found')}
        </Typography>
      </View>
    )

  const levelConfig =
    LEVEL_CONFIG[notification.level as keyof typeof LEVEL_CONFIG]

  return (
    <ScrollView className='flex-1 p-4' contentContainerClassName='gap-4'>
      <View className='flex-row items-center justify-between'>
        <Badge variant={levelConfig.variant}>
          <Typography>{t(levelConfig.labelKey)}</Typography>
        </Badge>

        <Typography className='text-xs text-muted-foreground'>
          {formatDate(notification.createdAt, {
            mode: 'all',
            locale: i18n.resolvedLanguage,
          })}
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
          <CardTitle>{t('detail.sections.details')}</CardTitle>
        </CardHeader>

        <CardContent>
          {notification.deviceId && (
            <View className='flex-row justify-between'>
              <CardDescription>
                {t('detail.sections.device_id')}
              </CardDescription>
              <Link href={`/(tabs)/pill-boxes/${notification.deviceId}`}>
                <Typography className='text-sm' selectable>
                  {notification.deviceId}
                </Typography>
              </Link>
            </View>
          )}

          {notification.scheduleId && (
            <View className='flex-row justify-between'>
              <CardDescription>
                {t('detail.sections.schedule_id')}
              </CardDescription>
              <Link href={`/(tabs)/schedules/${notification.scheduleId}`}>
                <Typography className='text-sm' selectable>
                  {notification.scheduleId}
                </Typography>
              </Link>
            </View>
          )}
        </CardContent>
      </Card>

      {notification.payload && Object.keys(notification.payload).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('detail.sections.payload_metadata')}</CardTitle>
          </CardHeader>

          <CardContent>
            <View className='gap-2 rounded-lg bg-muted/50 p-3'>
              {Object.entries(notification.payload).map(([key, value]) => (
                <View key={key} className='flex-row justify-between gap-4'>
                  <Typography className='text-xs font-semibold text-muted-foreground capitalize'>
                    {key.split('_').join(' ')}:
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
