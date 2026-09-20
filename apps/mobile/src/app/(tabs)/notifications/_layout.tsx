import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useOptions } from '@/hooks/use-options'

export default function TabsNotificationsLayout() {
  const { t } = useTranslation('notification')
  const screenOptions = useOptions()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name='index' options={{ title: t('title') }} />
      <Stack.Screen name='[id]' options={{ title: t('detail.title') }} />
    </Stack>
  )
}
