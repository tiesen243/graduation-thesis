// oxlint-disable react/set-state-in-effect

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
  const { deviceInfo, status, lastResponse, sendCommand } = useBLE()

  const [localTime, setLocalTime] = useState({ hours: 0, minutes: 0 })

  useEffect(() => {
    if (deviceInfo) setLocalTime(deviceInfo.syncTime)
  }, [deviceInfo])

  useEffect(() => {
    if (!lastResponse || lastResponse.action !== ACTION_CODES.SET_SYNC_TIME_RES)
      return
    if (lastResponse.status === STATUS_CODES.SUCCESS)
      toast.success(t('config.sync.messages.success'))
    else toast.error(t('config.sync.messages.failed'))
  }, [lastResponse, t])

  if (status !== 'connected') return null

  const showTimePicker = () => {
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

        void sendCommand('set_sync_time', { hours, minutes })
        setLocalTime({ hours, minutes })
      },
      mode: 'time',
      is24Hour: true,
    })
  }

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
