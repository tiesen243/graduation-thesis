import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

import { useBLE, BLEProvider } from '@/components/profile/config/_context'
import { BLEConnection } from '@/components/profile/config/ble-connection'
import { LanguageConfig } from '@/components/profile/config/language-config'
import { SyncTimeConfig } from '@/components/profile/config/sync-time-config'
import { TimeoutConfig } from '@/components/profile/config/timeout-config'
import { UtcConfig } from '@/components/profile/config/utc-config'
import { WifiConfig } from '@/components/profile/config/wifi-config'

function ConfigContent() {
  const { deviceInfo, isConnected, handleDisconnect } = useBLE()

  useFocusEffect(
    useCallback(
      () => () => {
        if (isConnected) void handleDisconnect()
      },
      [isConnected, handleDisconnect]
    )
  )

  const configKey = deviceInfo
    ? `${deviceInfo.utc}-${deviceInfo.language}`
    : 'default'

  return (
    <KeyboardAvoidingView
      className='flex-1'
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        className='flex-1 p-4'
        contentContainerClassName='gap-6 grow flex-col pb-6'
        keyboardShouldPersistTaps='handled'
      >
        <BLEConnection />

        <LanguageConfig key={`${configKey}-lang`} />
        <UtcConfig key={`${configKey}-utc`} />
        <SyncTimeConfig key={`${configKey}-sync`} />
        <TimeoutConfig key={`${configKey}-timeout`} />

        <WifiConfig />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default function ProfileConfigScreen() {
  return (
    <BLEProvider>
      <ConfigContent />
    </BLEProvider>
  )
}
