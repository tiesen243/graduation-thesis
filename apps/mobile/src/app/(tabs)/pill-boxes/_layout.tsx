import { Button } from '@rozumari/ui/components/button'
import { LinkIcon } from '@rozumari/ui/components/icons'
import { Stack, useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'

import { useOptions } from '@/hooks/use-options'

export default function TabsPillBoxesLayout() {
  const { t } = useTranslation('pill-box')
  const screenOptions = useOptions()

  const router = useRouter()

  return (
    <Stack screenOptions={screenOptions} activityEnabled>
      <Stack.Screen
        name='index'
        options={{
          title: t('title'),
          headerRight: () => (
            <Button
              variant='ghost'
              size='icon'
              onPress={() => router.push('/(tabs)/pill-boxes/link')}
            >
              <LinkIcon className='size-5 shrink-0 text-foreground' />
            </Button>
          ),
        }}
      />

      <Stack.Screen name='link' options={{ title: t('link.title') }} />

      <Stack.Screen name='[id]' options={{ title: t('details.title') }} />
    </Stack>
  )
}
