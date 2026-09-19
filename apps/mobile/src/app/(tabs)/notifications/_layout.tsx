import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useOptions } from '@/hooks/use-options'

export default function TabsNotificationsLayout() {
  const screenOptions = useOptions()

  const { t } = useTranslation('notification')

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name='index' options={{ title: t('index.title') }} />
      <Stack.Screen name='[id]' options={{ title: t('detail.title') }} />
    </Stack>
  )
}
