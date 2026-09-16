import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Typography } from '@rozumari/ui/components/typography'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { FlatList, RefreshControl, View } from 'react-native'

import { CompartmentCard } from '@/components/pill-boxes/details/compartment-card'
import { PillBoxDetailsHeader } from '@/components/pill-boxes/details/header'
import { useRuntime } from '@/hooks/use-runtime'

export default function TabsPillBoxesDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: DeviceId }>()
  const { api } = useRuntime()

  const { data, isLoading, refetch, isRefetching } = useQuery(
    api.device.show.queryOptions({ params: { id } })
  )

  const device = data?.data

  if (isLoading || !device)
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Typography className='text-muted-foreground'>
          Loading device information...
        </Typography>
      </View>
    )

  return (
    <View className='flex-1 pt-4'>
      <PillBoxDetailsHeader device={device} />

      <Typography className='p-4 pb-2 font-semibold'>
        Compartment List ({device?.compartments.length})
      </Typography>

      <FlatList
        contentContainerClassName='px-4 gap-3 py-2'
        columnWrapperClassName='flex-1 gap-3'
        data={device.compartments}
        keyExtractor={(comp) => comp.position}
        renderItem={({ item }) => <CompartmentCard compartment={item} />}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch as never}
          />
        }
      />
    </View>
  )
}
