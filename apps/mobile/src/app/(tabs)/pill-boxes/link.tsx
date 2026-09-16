import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { CameraView as ICameraView } from 'expo-camera'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, View } from 'react-native'

import type { ScanState } from '@/components/pill-boxes/link/scan-overplay'

import { ScanActionButton } from '@/components/pill-boxes/link/scan-action-button'
import { ScanOverlay } from '@/components/pill-boxes/link/scan-overplay'
import { useRuntime } from '@/hooks/use-runtime'

let CameraView: typeof ICameraView | null = null
try {
  // oxlint-disable-next-line node/global-require unicorn/prefer-module
  ;({ CameraView } = require('expo-camera'))
} catch {
  // noop
}

export default function TabsPillBoxesLinkScreen() {
  const cameraRef = useRef<ICameraView>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')

  const isScannedRef = useRef(false)
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { api } = useRuntime()
  const queryClient = useQueryClient()
  const router = useRouter()

  if (!CameraView) return null

  const clearScanTimeout = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }
  }

  const resetState = async () => {
    await cameraRef.current?.resumePreview()
    isScannedRef.current = false
    setScanState('idle')
  }

  const handleBarCodeScanned = async ({
    data: scannedDeviceId,
  }: Readonly<{ type: string; data: string }>) => {
    if (isScannedRef.current) return

    isScannedRef.current = true
    clearScanTimeout()

    await cameraRef.current?.pausePreview()
    setScanState('processing')

    try {
      const response = await api.device.show.query({
        params: { id: scannedDeviceId as DeviceId },
      })
      if (!response?.data) throw new Error('Device not found.')

      const deviceName = response.data.name ?? response.data.factoryModel

      Alert.alert(
        'Link Device',
        `Do you want to link with ${deviceName}?`,
        [
          { text: 'Cancel', style: 'cancel', onPress: resetState },
          {
            text: 'OK',
            onPress: async () => {
              setScanState('linking')

              try {
                await api.device.link.mutate({
                  payload: { id: response.data.id },
                })

                await queryClient.invalidateQueries({
                  queryKey: api.device.me.getQueryKey(),
                })
                Alert.alert('Success', 'Device Linked!', [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)/pill-boxes'),
                  },
                ])
              } catch (error) {
                Alert.alert(
                  'Link Failed',
                  error instanceof Error
                    ? error.message
                    : 'Failed to link with the device. Please try again.',
                  [{ text: 'OK', onPress: resetState }]
                )
              }
            },
          },
        ],
        { cancelable: false }
      )
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to fetch device info. Please try again.',
        [{ text: 'OK', onPress: resetState }]
      )
    }
  }

  const handleStartScan = async () => {
    isScannedRef.current = false
    setScanState('scanning')

    await cameraRef.current?.resumePreview()

    clearScanTimeout()
    scanTimeoutRef.current = setTimeout(async () => {
      isScannedRef.current = true
      await cameraRef.current?.pausePreview()

      Alert.alert('Scan Failed', 'No QR code detected. Please try again.', [
        { text: 'OK', onPress: resetState },
      ])
    }, 5000)
  }

  const isBusy = scanState !== 'idle'

  return (
    <View className='flex-1 justify-end bg-black'>
      <CameraView
        ref={cameraRef}
        facing='back'
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={
          scanState === 'scanning' ? handleBarCodeScanned : undefined
        }
      />

      <ScanOverlay scanState={scanState} />
      <ScanActionButton onPress={handleStartScan} disabled={isBusy} />
    </View>
  )
}
