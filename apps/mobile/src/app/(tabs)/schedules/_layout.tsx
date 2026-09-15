import { Button } from '@rozumari/ui/components/button'
import { PencilIcon, PlusIcon } from '@rozumari/ui/components/icons'
import { Stack, useGlobalSearchParams, useRouter } from 'expo-router'
import { View } from 'react-native'

import { SyncScheduleButton } from '@/components/schedule/sync-schedule-button'
import { useOptions } from '@/hooks/use-options'

export default function TabsSchedulesLayout() {
  const screenOptions = useOptions()
  const router = useRouter()

  const { id } = useGlobalSearchParams<{ id: string }>()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Schedules',
          headerRight: () => (
            <View className='flex-row items-center gap-2'>
              <SyncScheduleButton />

              <Button
                variant='ghost'
                size='icon'
                onPress={() => router.push('/(tabs)/schedules/create')}
              >
                <PlusIcon className='size-5 text-foreground' />
              </Button>
            </View>
          ),
        }}
      />

      <Stack.Screen name='create' options={{ title: 'Create Schedule' }} />

      <Stack.Screen
        name='[id]/index'
        options={{
          title: 'Schedule Details',
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push(`/(tabs)/schedules/${id}/edit`)}
            >
              <PencilIcon className='size-5 text-foreground' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='[id]/edit' options={{ title: 'Edit Schedule' }} />
    </Stack>
  )
}
