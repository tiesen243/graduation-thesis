import { Stack } from 'expo-router'

import { useOptions } from '@/hooks/use-options'

export default function TabsNotificationsLayout() {
  const screenOptions = useOptions()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name='index' options={{ title: 'Notifications' }} />
      <Stack.Screen name='[id]' options={{ title: 'Notification' }} />
    </Stack>
  )
}
