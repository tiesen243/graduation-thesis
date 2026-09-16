import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'

import { Button } from '@rozumari/ui/components/button'
import { Card, CardContent } from '@rozumari/ui/components/card'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { CameraView } from 'expo-camera'
import { useRef, useState } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'

import { useRuntime } from '@/hooks/use-runtime'

type ScanState = 'idle' | 'scanning' | 'processing' | 'linking'

export default function TabsPillBoxesLinkScreen() {
  const cameraRef = useRef<CameraView>(null)
  const [scanState, setScanState] = useState<ScanState>('idle')

  const isScannedRef = useRef(false)
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { api } = useRuntime()
  const handleLink = useMutation({
    ...api.device.link.mutationOptions(),
  })

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

      const deviceName =
        response?.data?.name ?? response?.data?.factoryModel ?? 'this device'

      Alert.alert(
        'Link Device',
        `Do you want to link with ${deviceName}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: resetState,
          },
          {
            text: 'OK',
            onPress: async () => {
              setScanState('linking')

              try {
                await handleLink.mutateAsync({
                  params: { id: scannedDeviceId as DeviceId },
                })

                Alert.alert('Success', 'Device Linked!', [
                  {
                    text: 'OK',
                    onPress: resetState,
                  },
                ])
              } catch (error) {
                Alert.alert(
                  'Link Failed',
                  error instanceof Error
                    ? error.message
                    : 'Failed to link with the device. Please try again.',
                  [
                    {
                      text: 'OK',
                      onPress: resetState,
                    },
                  ]
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
        [
          {
            text: 'OK',
            onPress: resetState,
          },
        ]
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
        {
          text: 'OK',
          onPress: resetState,
        },
      ])
    }, 5000)
  }

  const getOverlayText = () => {
    switch (scanState) {
      case 'processing': {
        return 'QR detected, processing...'
      }
      case 'linking': {
        return 'Linking device...'
      }
      default: {
        return 'Scanning QR code...'
      }
    }
  }

  const isBusy = scanState !== 'idle'

  return (
    <View className='flex-1 justify-end bg-black'>
      <CameraView
        ref={cameraRef}
        facing='back'
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={
          scanState === 'scanning' ? handleBarCodeScanned : undefined
        }
      />

      {isBusy && (
        <View
          className='inset-0 z-50 size-full items-center justify-center bg-black/50'
          pointerEvents='none'
        >
          <ActivityIndicator size='large' colorClassName='accent-white' />

          <Typography className='mt-3 text-base font-semibold text-white'>
            {getOverlayText()}
          </Typography>
        </View>
      )}

      {/* Bottom action */}
      <Card className='z-10 rounded-none pb-8'>
        <CardContent className='items-center justify-center p-0'>
          <View className='size-20 items-center justify-center rounded-full border-4 border-card-foreground/80 p-1'>
            <Button
              onPress={handleStartScan}
              disabled={isBusy}
              className={cn(
                'size-full rounded-full bg-card-foreground disabled:opacity-100',
                !isBusy && 'active:scale-95'
              )}
            />
          </View>
        </CardContent>
      </Card>
    </View>
  )
}
