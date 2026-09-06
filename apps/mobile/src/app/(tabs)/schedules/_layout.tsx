import { Button } from '@rozumari/ui/components/button'
import { PlusIcon } from '@rozumari/ui/components/icons'
import { Stack, useRouter } from 'expo-router'

import { useOptions } from '@/hooks/use-options'

export default function TabsSchedulesLayout() {
  const screenOptions = useOptions()
  const router = useRouter()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Schedules',
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push('/(tabs)/schedules/create')}
            >
              <PlusIcon className='size-5 text-foreground' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='create' options={{ title: 'Create Schedule' }} />
    </Stack>
  )
}
