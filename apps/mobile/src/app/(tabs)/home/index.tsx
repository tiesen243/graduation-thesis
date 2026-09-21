import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
} from '@rozumari/ui/components/icons'
import { formatDate } from '@rozumari/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, ScrollView, View } from 'react-native'

import { RefreshControl } from '@/components/native'
import { useRuntime } from '@/hooks/use-runtime'

const LEVEL_MAPPING = {
  error: <AlertCircleIcon className='size-4 shrink-0 text-destructive' />,
  info: <InfoIcon className='size-4 shrink-0 text-info' />,
  warning: <AlertTriangleIcon className='size-4 shrink-0 text-warning' />,
} as const

export default function TabsHomeIndexScreen() {
  const { t } = useTranslation(['home', 'schedule'])
  const { api } = useRuntime()

  const { data, isPending, refetch, isRefetching } = useQuery(
    api.dashboard.user.queryOptions()
  )

  if (isPending || !data?.data)
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <ActivityIndicator size='large' />
      </View>
    )

  const { metrics, lowStockCompartments, recentNotifications } = data.data

  return (
    <ScrollView
      className='flex-1'
      contentContainerClassName='gap-4 p-4'
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch as never}
        />
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>{t('home:pending_schedules')}</CardTitle>
          <CardDescription className='text-2xl font-bold text-warning'>
            {metrics.todaySchedules.pending}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('low_stock_compartments.title')}</CardTitle>
          <CardDescription>
            {t('low_stock_compartments.description', {
              count: metrics.lowStockCount,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lowStockCompartments.map((compartment) => (
            <Card key={`${compartment.deviceId}-${compartment.position}`}>
              <Link href={`/(tabs)/pill-boxes/${compartment.deviceId}`}>
                <CardHeader className='w-full'>
                  <CardTitle>{compartment.medicine}</CardTitle>
                  <CardDescription>
                    Position: {compartment.position}
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('recent_notifications.title')}</CardTitle>
          <CardDescription>
            {t('recent_notifications.description', {
              count: recentNotifications.length,
            })}
          </CardDescription>
        </CardHeader>

        <View className='gap-3 px-4'>
          {recentNotifications.map((notification) => (
            <Card key={notification.id}>
              <Link href={`/(tabs)/notifications/${notification.id}`}>
                <CardHeader className='w-full flex-row items-start gap-2'>
                  {
                    LEVEL_MAPPING[
                      notification.level as keyof typeof LEVEL_MAPPING
                    ]
                  }
                  <View className='flex-1 gap-1'>
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription>{notification.body}</CardDescription>
                  </View>

                  <CardDescription>
                    {formatDate(notification.createdAt, {
                      mode: 'custom',
                      custom: 'HH:mm',
                    })}
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </View>
      </Card>
    </ScrollView>
  )
}
