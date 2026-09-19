import { ChevronRightIcon } from '@rozumari/ui/components/icons'
import { Typography } from '@rozumari/ui/components/typography'
import * as Constants from 'expo-constants'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'

import { ProfileSettingsLanguage } from '@/components/profile/settings/language'
import { ProfileSettingsTheme } from '@/components/profile/settings/theme'

export default function TabsProfileSettingsScreen() {
  const { t } = useTranslation(['profile'])
  const router = useRouter()

  return (
    <View className='gap-4 p-4'>
      <ProfileSettingsTheme />

      <ProfileSettingsLanguage />

      <Pressable
        onPress={() => router.push('/(tabs)/profile/config')}
        className='flex-row items-center justify-between'
      >
        <Typography variant='h3'>{t('config.title')}</Typography>
        <ChevronRightIcon className='size-5 text-foreground' />
      </Pressable>

      <View className='gap-2'>
        <Typography variant='h3'>{t('settings.version')}</Typography>
        <Typography>{Constants.default.expoConfig?.version}</Typography>
      </View>
    </View>
  )
}
