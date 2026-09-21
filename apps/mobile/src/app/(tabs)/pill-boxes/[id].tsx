import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

import { RefreshControl } from '@/components/native'
import { CompartmentCard } from '@/components/pill-boxes/compartment-card'
import { DropButton } from '@/components/pill-boxes/drop-button'
import { PillBoxDetailsHeader } from '@/components/pill-boxes/header'
import { useRuntime } from '@/hooks/use-runtime'

export default function TabsPillBoxesDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: DeviceId }>()
  const { t } = useTranslation('pill-box')
  const { api } = useRuntime()

  const { data, isLoading, refetch, isRefetching } = useQuery(
    api.device.show.queryOptions({ params: { id } })
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

          <View className='flex-row items-center justify-between pt-2'>
            <Typography className='font-semibold'>
              {t('details.compartment_list', {
                count: device.compartments.length,
              })}
            </Typography>

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
