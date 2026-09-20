import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import { Badge } from '@rozumari/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@rozumari/ui/components/card'
import {
  AsteriskIcon,
  CalendarIcon,
  ClockIcon,
  CpuIcon,
} from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import { formatDate } from '@rozumari/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { ActivityIndicator } from '@/components/native'
import { useRuntime } from '@/hooks/use-runtime'

const STATUS_MAPPERS = {
  pending: { key: 'index.statuses.pending', variant: 'warning' },
  completed: { key: 'index.statuses.completed', variant: 'success' },
  failed: { key: 'index.statuses.missed', variant: 'destructive' },
} as const

export default function TabsSchedulesDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: ScheduleId }>()
  const { t, i18n } = useTranslation('schedule')
  const { api } = useRuntime()

  const { data, isLoading } = useQuery(
    api.schedule.show.queryOptions({ params: { id } })
  )

  if (isLoading || !data?.data)
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator size='large' />
      </View>
    )

  const { date, time, device, items, status: _status } = data.data
  const status = STATUS_MAPPERS[_status as keyof typeof STATUS_MAPPERS]

  return (
    <View className='gap-4 p-4'>
      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <CardTitle>{t('detail.sections.scheduleInformation')}</CardTitle>
          <Badge variant={status.variant}>
            <Typography>{t(status.key)}</Typography>
          </Badge>
        </CardHeader>
        <CardContent className='gap-1'>
          <View className='flex-row items-center gap-2'>
            <CalendarIcon className='size-4 text-muted-foreground' />

            <Typography>
              {formatDate(date, {
                mode: 'custom',
                custom: 'eee, MMM d, yyyy',
                locale: i18n.resolvedLanguage,
              })}
            </Typography>
          </View>
          <View className='flex-row items-center gap-2'>
            <ClockIcon className='size-4 text-muted-foreground' />
            <Typography>{time}</Typography>
          </View>
          <View className='flex-row items-center gap-2'>
            <CpuIcon className='size-4 text-muted-foreground' />
            <Typography>{device.name ?? device.id}</Typography>

            {device.position && (
              <Badge variant='outline'>
                <Typography>{data.data.device.position}</Typography>
              </Badge>
            )}
          </View>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.sections.medicationItems')}</CardTitle>
        </CardHeader>
        <CardContent className='gap-3'>
          {items.map((item) => (
            <Card key={item.slot} className='flex-row justify-between'>
              <CardHeader>
                <CardTitle>
                  {item.medicine}
                  {item.isRequired && (
                    <AsteriskIcon className='size-3 text-destructive' />
                  )}
                </CardTitle>
                <CardDescription>
                  {t('items.slot')}: {item.slot}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <CardDescription>
                  {t('items.quantity')} {item.quantity}
                </CardDescription>
                <CardDescription>
                  {t('items.dosage')} {item.dosage}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </View>
  )
}
