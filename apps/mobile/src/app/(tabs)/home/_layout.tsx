import { Stack } from 'expo-router'

import { useOptions } from '@/hooks/use-options'
import { env } from '@/lib/env'

export default function TabsHomeLayout() {
  const screenOptions = useOptions()

  return (
    <Stack screenOptions={screenOptions} activityEnabled>
      <Stack.Screen
        name='index'
        options={{ title: env.EXPO_PUBLIC_APP_NAME }}
      />
    </Stack>
  )
}
