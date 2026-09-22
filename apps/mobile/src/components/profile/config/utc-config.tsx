import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import {
  ACTION_CODES,
  STATUS_CODES,
  useBLE,
} from '@/components/profile/config/_context'

export const UTC_OPTIONS = [
  { label: 'Pacific/Pago_Pago (UTC-11)', value: '-11' },
  { label: 'Pacific/Honolulu (UTC-10)', value: '-10' },
  { label: 'America/Anchorage (UTC-9)', value: '-9' },
  { label: 'America/Los_Angeles (UTC-8)', value: '-8' },
  { label: 'America/Denver (UTC-7)', value: '-7' },
  { label: 'America/Chicago (UTC-6)', value: '-6' },
  { label: 'America/New_York (UTC-5)', value: '-5' },
  { label: 'America/Caracas (UTC-4)', value: '-4' },
  { label: 'America/Sao_Paulo (UTC-3)', value: '-3' },
  { label: 'America/Noronha (UTC-2)', value: '-2' },
  { label: 'Atlantic/Cape_Verde (UTC-1)', value: '-1' },
  { label: 'Europe/London (UTC+0)', value: '0' },
  { label: 'Europe/Paris (UTC+1)', value: '1' },
  { label: 'Europe/Athens (UTC+2)', value: '2' },
  { label: 'Asia/Riyadh (UTC+3)', value: '3' },
  { label: 'Asia/Dubai (UTC+4)', value: '4' },
  { label: 'Asia/Tashkent (UTC+5)', value: '5' },
  { label: 'Asia/Dhaka (UTC+6)', value: '6' },
  { label: 'Asia/Ho_Chi_Minh (UTC+7)', value: '7' },
  { label: 'Asia/Singapore (UTC+8)', value: '8' },
  { label: 'Asia/Tokyo (UTC+9)', value: '9' },
  { label: 'Australia/Sydney (UTC+10)', value: '10' },
  { label: 'Pacific/Guadalcanal (UTC+11)', value: '11' },
  { label: 'Pacific/Auckland (UTC+12)', value: '12' },
  { label: 'Pacific/Tongatapu (UTC+13)', value: '13' },
  { label: 'Pacific/Kiritimati (UTC+14)', value: '14' },
] as const

export function UtcConfig() {
  const { t } = useTranslation('profile')
  const { deviceInfo, isConnected, sendBleCommand, registerByteHandler } =
    useBLE()

  React.useEffect(
    () =>
      registerByteHandler((action, status) => {
        if (action === ACTION_CODES.SET_UTC_RES) {
          if (status === STATUS_CODES.SUCCESS)
            toast.success(t('config.utc.messages.success'))
          else toast.error(t('config.utc.messages.failed'))
        }
      }),
    [registerByteHandler, t]
  )

  if (!isConnected) return null

  return (
    <View className='gap-3'>
      <Typography className='font-semibold'>{t('config.utc.title')}</Typography>

      <Select
        defaultValue={String(deviceInfo?.utc)}
        onValueChange={(value) =>
          sendBleCommand('set_utc', { utc: Math.trunc(Number(value)) })
        }
      >
        <SelectTrigger>
          <SelectValue
            placeholder={t('config.utc.selector.placeholder')}
            items={[...UTC_OPTIONS]}
          />
        </SelectTrigger>
        <SelectContent title={t('config.utc.selector.title')}>
          {UTC_OPTIONS.map((item) => (
            <SelectItem key={item.value} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </View>
  )
}
