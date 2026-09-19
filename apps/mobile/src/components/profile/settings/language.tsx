import { RadioGroup, RadioGroupItem } from '@rozumari/ui/components/radio-group'
import { Typography } from '@rozumari/ui/components/typography'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import type { SupportedLanguage } from '@/lib/i18n'

import { setLanguage } from '@/lib/secure-store'

export const ProfileSettingsLanguage = () => {
  const { i18n } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage

  return (
    <View className='gap-2'>
      <Typography variant='h3'>Language</Typography>

      <RadioGroup
        value={currentLanguage ?? 'en'}
        onValueChange={async (value) => {
          await setLanguage(value as SupportedLanguage)
          await i18n.changeLanguage(value)
        }}
      >
        <RadioGroupItem value='en'>
          <Typography>English</Typography>
        </RadioGroupItem>
        <RadioGroupItem value='vi'>
          <Typography>Tiếng Việt</Typography>
        </RadioGroupItem>
      </RadioGroup>
    </View>
  )
}
