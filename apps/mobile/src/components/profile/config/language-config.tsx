import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import {
  ACTION_CODES,
  STATUS_CODES,
  useBLE,
} from '@/components/profile/config/_context'

const LANGUAGES = [
  { key: 'settings.language.options.en', value: 'en' },
  { key: 'settings.language.options.vi', value: 'vi' },
] as const

export function LanguageConfig() {
  const { t } = useTranslation('profile')
  const { deviceInfo, status, lastResponse, sendCommand } = useBLE()

  useEffect(() => {
    if (!lastResponse || lastResponse.action !== ACTION_CODES.SET_LANGUAGE_RES)
      return
    if (lastResponse.status === STATUS_CODES.SUCCESS)
      toast.success(t('config.language.messages.success'))
    else toast.error(t('config.language.messages.failed'))
  }, [lastResponse, t])

  if (status !== 'connected') return null

  return (
    <View className='gap-3'>
      <Typography className='font-semibold'>
        {t('config.language.title')}
      </Typography>

      <Select
        defaultValue={deviceInfo?.language}
        items={LANGUAGES.map((item) => ({
          value: item.value,
          label: t(item.key),
        }))}
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t('config.language.selector.placeholder')}
          />
        </SelectTrigger>
        <SelectContent title={t('config.language.selector.title')}>
          {LANGUAGES.map((item) => (
            <SelectItem
              key={item.key}
              value={item.value}
              onPress={() => {
                void sendCommand('set_language', { language: item.value })
              }}
            >
              {t(item.key)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </View>
  )
}
