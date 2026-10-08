import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { useSubscription } from '@tiesen/effect-tanstack-query/react'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

import { RefreshControl } from '@/components/native'
import { CompartmentCard } from '@/components/pill-boxes/compartment-card'
import { DropButton } from '@/components/pill-boxes/drop-button'
import { PillBoxDetailsHeader } from '@/components/pill-boxes/header'
import { SyncButton } from '@/components/pill-boxes/sync-button'
import { useRuntime } from '@/hooks/use-runtime'

export default function TabsPillBoxesDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: DeviceId }>()
  const { t } = useTranslation('pill-box')
  const { api } = useRuntime()

  const { data, isLoading, refetch, isRefetching } = useQuery(
    api.device.show.queryOptions({ params: { id } })
  )

  useSubscription(
    api.device.subscribe.subscriptionOptions(
      { params: { id } },
      {
        autoReconnect: '3 seconds',
        keepAlive: { timeout: '35 seconds' },
        onData: ({ action, payload }) => {
          if (action === 'message' && payload && typeof payload === 'object') {
            const { type, content } = payload as {
              type?: string
              content: string
            }

            if (type === 'success') toast.success(content)
            else if (type === 'error') toast.error(content)
            else toast.show(content)
          } else console.log('subscription data', action, payload)
        },
        onError: (error) => toast.error(error.message),
      }
    )
  )

  const device = data?.data
  if (isLoading || !device)
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Typography className='text-muted-foreground'>
          {t('details.loading')}
        </Typography>
      </View>
    )

  return (
    <FlatList
      contentContainerClassName='p-4 gap-3'
      columnWrapperClassName='flex-1 gap-3'

      data={device.compartments}
      keyExtractor={(comp) => comp.position}
      renderItem={({ item }) => <CompartmentCard compartment={item} />}
      numColumns={2}

      ListHeaderComponent={
        <>
          <PillBoxDetailsHeader device={device} />

          <View className='flex-row items-center gap-2 pt-4'>
            <Typography className='flex-1 font-semibold'>
              {t('details.compartment_list', {
                count: device.compartments.length,
              })}
            </Typography>

            <SyncButton id={id} />

            <DropButton id={id} compartments={device.compartments ?? []} />
          </View>
        </>
      }

      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch as never}
        />
      }
    />
  )
}
