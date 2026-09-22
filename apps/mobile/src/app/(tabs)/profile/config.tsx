import { ScrollView } from 'react-native'

import { useBLE, BLEProvider } from '@/components/profile/config/_context'
import { BLEConnection } from '@/components/profile/config/ble-connection'
import { LanguageConfig } from '@/components/profile/config/language-config'
import { SyncTimeConfig } from '@/components/profile/config/sync-time-config'
import { UtcConfig } from '@/components/profile/config/utc-config'
import { WifiConfig } from '@/components/profile/config/wifi-config'

function ConfigContent() {
  const { deviceInfo } = useBLE()

  const configKey = deviceInfo
    ? `${deviceInfo.utc}-${deviceInfo.language}`
    : 'default'

  return (
    <ScrollView className='p-4' contentContainerClassName='gap-4'>
      <BLEConnection />

      <LanguageConfig key={`${configKey}-lang`} />
      <UtcConfig key={`${configKey}-utc`} />
      <SyncTimeConfig key={`${configKey}-sync`} />

      <WifiConfig />
    </ScrollView>
  )
}

export default function ProfileConfigScreen() {
  return (
    <BLEProvider>
      <ConfigContent />
    </BLEProvider>
  )
}
