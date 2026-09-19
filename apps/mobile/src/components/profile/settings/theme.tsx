import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { Typography } from '@rozumari/ui/components/typography'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { useUniwind, Uniwind } from 'uniwind'

import { setTheme } from '@/lib/secure-store'

export const ProfileSettingsTheme = () => {
  const { theme, hasAdaptiveThemes } = useUniwind()
  const { t } = useTranslation(['profile'])

  return (
    <View className='gap-2'>
      <Typography variant='h3'>{t('settings.darkMode.title')}</Typography>
      <Typography className='text-sm text-muted-foreground'>
        {t('settings.darkMode.description')}
      </Typography>

      <RadioGroup
        value={hasAdaptiveThemes ? 'system' : theme}
        onValueChange={async (value) => {
          await setTheme(value as 'light' | 'dark' | 'system')
          Uniwind.setTheme(value as 'light' | 'dark' | 'system')
        }}
      >
        <RadioGroupItem value='light'>
          <Typography>{t('settings.darkMode.options.off')}</Typography>
        </RadioGroupItem>
        <RadioGroupItem value='dark'>
          <Typography>{t('settings.darkMode.options.on')}</Typography>
        </RadioGroupItem>
        <RadioGroupItem value='system'>
          <Typography>{t('settings.darkMode.options.system')}</Typography>
        </RadioGroupItem>
      </RadioGroup>
    </View>
  )
}
