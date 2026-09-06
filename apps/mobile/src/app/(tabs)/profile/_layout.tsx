import { Button } from '@rozumari/ui/components/button'
import { SettingsIcon } from '@rozumari/ui/components/icons'
import { Stack, useRouter } from 'expo-router'

import { useOptions } from '@/hooks/use-options'

export default function TabsProfileLayout() {
  const screenOptions = useOptions()
  const router = useRouter()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name='index'
        options={{
          title: 'Profile',
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push('/(tabs)/profile/settings')}
            >
              <SettingsIcon className='size-5 text-foreground' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='settings' options={{ title: 'Settings' }} />
    </Stack>
  )
}
