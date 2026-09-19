import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Button } from '@rozumari/ui/components/button'
import { toast } from '@rozumari/ui/components/toast'
import { Typography } from '@rozumari/ui/components/typography'
import { getCalendars } from 'expo-localization'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import {
  ACTION_CODES,
  STATUS_CODES,
  useBLE,
} from '@/components/profile/config/_context'

const [{ timeZone }] = getCalendars()

export function SyncTimeConfig() {
  const { t } = useTranslation('profile')
  const { deviceInfo, isConnected, sendBleCommand, registerByteHandler } =
    useBLE()

  const [localTime, setLocalTime] = useState({
    hours: deviceInfo?.syncTime.hours ?? 0,
    minutes: deviceInfo?.syncTime.minutes ?? 0,
  })

  useEffect(
    () =>
      registerByteHandler((action, status) => {
        if (action === ACTION_CODES.SET_SYNC_TIME_RES) {
          if (status === STATUS_CODES.SUCCESS)
            toast.success('Sync time updated!')
          else toast.error('Failed to update sync time!')
        }
      }),
    [registerByteHandler]
  )

  if (!isConnected) return null

  const showTimePicker = () =>
    DateTimePickerAndroid.open({
      value: new Date(0, 0, 0, localTime.hours, localTime.minutes),
      onValueChange: (_event, date) => {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timeZone ?? 'UTC',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        })

        const parts = formatter.formatToParts(date)
        let hours = 0
        let minutes = 0

        for (const part of parts) {
          if (part.type === 'hour') hours = Math.trunc(Number(part.value))
          if (part.type === 'minute') minutes = Math.trunc(Number(part.value))
        }

        sendBleCommand('set_sync_time', { hours, minutes })
        setLocalTime({ hours, minutes })
      },
      mode: 'time',
      is24Hour: true,
    })

  return (
    <View className='gap-3'>
      <Typography className='font-semibold'>
        {t('config.sync.title')}
      </Typography>

      <Button variant='outline' onPress={showTimePicker}>
        <Typography>
          {localTime.hours.toString().padStart(2, '0')}:
          {localTime.minutes.toString().padStart(2, '0')}
        </Typography>
      </Button>
    </View>
  )
}
