import { Stack } from 'expo-router'

import { useOptions } from '@/hooks/use-options'

export default function TabsHomeLayout() {
  const screenOptions = useOptions()

  return (
    <Stack screenOptions={screenOptions} activityEnabled>
      <Stack.Screen name='index' options={{ title: 'Rozumari' }} />
    </Stack>
  )
}
