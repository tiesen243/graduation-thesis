import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { CameraView as ICameraView } from 'expo-camera'

import { Button } from '@rozumari/ui/components/button'
import { Card, CardContent } from '@rozumari/ui/components/card'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, View } from 'react-native'

import { ActivityIndicator } from '@/components/native'
import { useRuntime } from '@/hooks/use-runtime'

let CameraView: typeof ICameraView | null = null
try {
  // oxlint-disable-next-line node/global-require unicorn/prefer-module
  ;({ CameraView } = require('expo-camera'))
} catch {
  // noop
}

export default function TabsPillBoxesLinkScreen() {
  const { t } = useTranslation('pill-box')
  const [scanState, setScanState] = useState<
    'idle' | 'scanning' | 'processing' | 'linking'
  >('idle')

  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cameraRef = useRef<ICameraView>(null)
  const isScannedRef = useRef(false)

  const queryClient = useQueryClient()
  const { api } = useRuntime()
  const router = useRouter()

  const clearScanTimeout = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }
  }, [])

  const resetState = useCallback(async () => {
    await cameraRef.current?.resumePreview()
    isScannedRef.current = false
    setScanState('idle')
  }, [])

  const handleBarCodeScanned = useCallback(
    async ({
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
        if (!response?.data) throw new Error(t('link.not_found'))

        const deviceName = response.data.name ?? response.data.factoryModel

        Alert.alert(
          t('link.title'),
          t('link.dialog.message', { deviceName }),
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
                  Alert.alert(
                    t('link.dialog.success.title'),
                    t('link.dialog.success.message'),
                    [
                      {
                        text: 'OK',
                        onPress: () => router.push('/(tabs)/pill-boxes'),
                      },
                    ]
                  )
                } catch (error) {
                  Alert.alert(
                    t('link.dialog.error.title'),
                    error instanceof Error
                      ? error.message
                      : t('link.dialog.error.message'),
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
          t('link.dialog.error.title'),
          error instanceof Error
            ? error.message
            : t('link.dialog.error.message'),
          [{ text: 'OK', onPress: resetState }]
        )
      }
    },
    [
      t,
      router,
      api.device.link,
      api.device.show,
      api.device.me,
      queryClient,
      clearScanTimeout,
      resetState,
    ]
  )

  const handleStartScan = useCallback(async () => {
    isScannedRef.current = false
    setScanState('scanning')

    await cameraRef.current?.resumePreview()

    clearScanTimeout()
    scanTimeoutRef.current = setTimeout(async () => {
      isScannedRef.current = true
      await cameraRef.current?.pausePreview()

      Alert.alert(t('link.scan_failed.title'), t('link.scan_failed.message'), [
        { text: 'OK', onPress: resetState },
      ])
    }, 5000)
  }, [t, clearScanTimeout, resetState])

  if (!CameraView) return null
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

      {scanState !== 'idle' && (
        <View
          className='inset-0 z-50 size-full items-center justify-center bg-black/50'
          pointerEvents='none'
        >
          <ActivityIndicator size='large' colorClassName='accent-white' />
          <Typography className='mt-3 text-base font-semibold text-white'>
            {t(`link.overplay.${scanState}`)}
          </Typography>
        </View>
      )}

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
