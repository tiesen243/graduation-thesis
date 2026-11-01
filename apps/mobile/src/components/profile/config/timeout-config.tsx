// oxlint-disable react/set-state-in-effect typescript/no-confusing-void-expression

import { Button } from '@rozumari/ui/components/button'
import { Input } from '@rozumari/ui/components/input'
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

export function TimeoutConfig() {
  const { t } = useTranslation('profile')
  const { deviceInfo, status, lastResponse, sendCommand } = useBLE()

  const [dropTimeout, setDropTimeout] = React.useState<number>(
    deviceInfo?.timeouts.drop ?? 0
  )
  const [openTimeout, setOpenTimeout] = React.useState<number>(
    deviceInfo?.timeouts.open ?? 0
  )
  const [closeTimeout, setCloseTimeout] = React.useState<number>(
    deviceInfo?.timeouts.close ?? 0
  )

  React.useEffect(() => {
    if (!deviceInfo) return
    setDropTimeout(deviceInfo.timeouts.drop)
    setOpenTimeout(deviceInfo.timeouts.open)
    setCloseTimeout(deviceInfo.timeouts.close)
  }, [deviceInfo])

  React.useEffect(() => {
    if (!lastResponse) return
    const { action, status: responseStatus } = lastResponse
    const messages = {
      [ACTION_CODES.SET_DROP_TIMEOUT_RES]: {
        success: t('config.timeout.drop.messages.success'),
        failed: t('config.timeout.drop.messages.failed'),
      },
      [ACTION_CODES.SET_OPEN_TIMEOUT_RES]: {
        success: t('config.timeout.open.messages.success'),
        failed: t('config.timeout.open.messages.failed'),
      },
      [ACTION_CODES.SET_CLOSE_TIMEOUT_RES]: {
        success: t('config.timeout.close.messages.success'),
        failed: t('config.timeout.close.messages.failed'),
      },
    } as const
    const message = messages[action as keyof typeof messages]
    if (!message) return
    if (responseStatus === STATUS_CODES.SUCCESS) toast.success(message.success)
    else toast.error(message.failed)
  }, [lastResponse, t])

  const handleSaveTimeouts = async () => {
    await sendCommand('set_drop_timeout', { timeout: dropTimeout })
    await sendCommand('set_open_timeout', { timeout: openTimeout })
    await sendCommand('set_close_timeout', { timeout: closeTimeout })
  }

  if (status !== 'connected') return null

  return (
    <View className='gap-3'>
      <Typography className='font-semibold'>
        {t('config.timeout.title')}
      </Typography>

      <View>
        <Typography>{t('config.timeout.drop.title')}</Typography>
        <Input
          value={dropTimeout.toString()}
          onChangeText={(text) => setDropTimeout(Number(text))}
          placeholder={t('config.timeout.drop.placeholder')}
          keyboardType='numeric'
        />
      </View>
      <View>
        <Typography>{t('config.timeout.open.title')}</Typography>
        <Input
          value={openTimeout.toString()}
          onChangeText={(text) => setOpenTimeout(Number(text))}
          placeholder={t('config.timeout.open.placeholder')}
          keyboardType='numeric'
        />
      </View>
      <View>
        <Typography>{t('config.timeout.close.title')}</Typography>
        <Input
          value={closeTimeout.toString()}
          onChangeText={(text) => setCloseTimeout(Number(text))}
          placeholder={t('config.timeout.close.placeholder')}
          keyboardType='numeric'
        />
      </View>

      <Button variant='outline' onPress={handleSaveTimeouts}>
        <Typography>{t('config.timeout.save')}</Typography>
      </Button>
    </View>
  )
}
