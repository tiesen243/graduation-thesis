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
  const { t } = useTranslation(['common', 'pill-box', 'profile'])
  const {
    status,
    devices,
    selectedDevice,
    setSelectedDevice,
    startScan,
    connect,
    disconnect,
    sendCommand,
  } = useBLE()

  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'
  const isScanning = status === 'scanning'

  return (
    <View className='gap-3'>
      <Select
        value={selectedDevice}
        onValueChange={setSelectedDevice}
        items={devices.map((device) => ({
          value: device.id,
          label: device.name ?? t('pill-box:details.device.unnamed_device'),
        }))}
      >
        <SelectTrigger
          disabled={isConnected || isConnecting || devices.length === 0}
          className={isConnected || isConnecting ? 'opacity-50' : ''}
        >
          <SelectValue
            placeholder={t('profile:config.device.selector.placeholder')}
          />
        </SelectTrigger>
        <SelectContent title={t('profile:config.device.selector.title')}>
          {devices.map((device) => (
            <SelectItem key={device.id} value={device.id}>
              <Typography>
                {device.name ?? t('pill-box:details.device.unnamed_device')} (
                {device.id})
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
            onPress={() => sendCommand('ping')}
          >
            Ping
          </Button>

          <Button className='flex-1' variant='destructive' onPress={disconnect}>
            {t('profile:config.actions.disconnect')}
          </Button>
        </View>
      ) : (
        <View className='flex-row gap-2'>
          <Button
            className='flex-1'
            variant='outline'
            onPress={startScan}
            disabled={isScanning}
          >
            {isScanning
              ? t('profile:config.actions.scanning')
              : t('profile:config.actions.scan')}
          </Button>

          <Button
            className='flex-1'
            onPress={connect}
            disabled={!selectedDevice || isConnecting || isScanning}
          >
            {isConnecting
              ? t('profile:config.actions.connecting')
              : t('profile:config.actions.connect')}
          </Button>
        </View>
      )}
    </View>
  )
}
