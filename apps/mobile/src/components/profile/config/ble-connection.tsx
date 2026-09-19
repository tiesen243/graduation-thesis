import { Button } from '@rozumari/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@rozumari/ui/components/select'
import { Typography } from '@rozumari/ui/components/typography'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { useBLE } from '@/components/profile/config/_context'

export function BLEConnection() {
  const { t } = useTranslation(['profile'])
  const {
    discoveredDevices,
    selectedDevice,
    setSelectedDevice,
    isConnected,
    isConnecting,
    handleConnect,
    handleDisconnect,
    sendBleCommand,
  } = useBLE()

  return (
    <View className='gap-3'>
      <Select value={selectedDevice} onValueChange={setSelectedDevice}>
        <SelectTrigger
          disabled={isConnected || isConnecting}
          className={isConnected || isConnecting ? 'opacity-50' : ''}
        >
          <SelectValue
            placeholder={t('config.device.selector.placeholder')}
            items={discoveredDevices.map((device) => ({
              value: device.id,
              label: device.name || t('config.device.unnamed'),
            }))}
          />
        </SelectTrigger>
        <SelectContent title={t('config.device.selector.title')}>
          {discoveredDevices.map((device) => (
            <SelectItem key={device.id} value={device.id}>
              <Typography>
                {device.name ?? t('config.device.unnamed')} ({device.id})
              </Typography>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isConnected ? (
        <View className='flex-row gap-2'>
          <Button
            className='flex-1'
            variant='outline'
            onPress={() => sendBleCommand('ping')}
          >
            Ping
          </Button>

          <Button
            className='flex-1'
            variant='destructive'
            onPress={handleDisconnect}
          >
            {t('config.actions.disconnect')}
          </Button>
        </View>
      ) : (
        <Button
          onPress={handleConnect}
          disabled={!selectedDevice || isConnecting}
        >
          {isConnecting
            ? t('config.actions.connecting')
            : t('config.actions.connect')}
        </Button>
      )}
    </View>
  )
}
