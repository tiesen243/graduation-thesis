import { Button } from '@rozumari/ui/components/button'
import { SettingsIcon } from '@rozumari/ui/components/icons'
import { Stack, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useOptions } from '@/hooks/use-options'

export default function TabsProfileLayout() {
  const { t } = useTranslation(['profile'])
  const screenOptions = useOptions()

  const router = useRouter()

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name='index'
        options={{
          title: t('title'),
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

      <Stack.Screen name='settings' options={{ title: t('settings.title') }} />

      <Stack.Screen name='config' options={{ title: t('config.title') }} />
    </Stack>
  )
}
