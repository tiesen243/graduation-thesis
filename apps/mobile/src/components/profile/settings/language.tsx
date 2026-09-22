import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { Typography } from '@rozumari/ui/components/typography'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import type { SupportedLanguage } from '@/lib/i18n'

import { setLanguage } from '@/lib/secure-store'

export const ProfileSettingsLanguage = () => {
  const { t, i18n } = useTranslation('profile')

  return (
    <View className='gap-2'>
      <Typography variant='h3'>{t('settings.language.title')}</Typography>
      <Typography className='text-sm text-muted-foreground'>
        {t('settings.language.description')}
      </Typography>

      <RadioGroup
        value={i18n.resolvedLanguage ?? 'en'}
        onValueChange={async (value) => {
          await setLanguage(value as SupportedLanguage)
          await i18n.changeLanguage(value)
        }}
      >
        <RadioGroupItem value='en'>
          <Typography>{t('settings.language.options.en')}</Typography>
        </RadioGroupItem>
        <RadioGroupItem value='vi'>
          <Typography>{t('settings.language.options.vi')}</Typography>
        </RadioGroupItem>
      </RadioGroup>
    </View>
  )
}
