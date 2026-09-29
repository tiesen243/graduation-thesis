import type { CameraView as ICameraView } from 'expo-camera'

import { Button } from '@rozumari/ui/components/button'
import { Card, CardContent } from '@rozumari/ui/components/card'
import { Typography } from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
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

type ScanState = 'idle' | 'scanning' | 'linking'

export default function TabsPillBoxesLinkScreen() {
  const { t } = useTranslation('pill-box')
  const { api } = useRuntime()
  const queryClient = useQueryClient()
  const router = useRouter()

  const [scanState, setScanState] = useState<ScanState>('idle')

  const cameraRef = useRef<ICameraView>(null)
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isScannedRef = useRef(false)

  const clearScanTimeout = useCallback(() => {
    if (!scanTimeoutRef.current) return

    clearTimeout(scanTimeoutRef.current)
    scanTimeoutRef.current = null
  }, [])

  const resetScan = useCallback(async () => {
    clearScanTimeout()

    isScannedRef.current = false

    await cameraRef.current?.resumePreview()
    setScanState('idle')
  }, [clearScanTimeout])

  const handleBarCodeScanned = useCallback(
    async ({ data: token }: Readonly<{ type: string; data: string }>) => {
      if (isScannedRef.current) return

      isScannedRef.current = true
      clearScanTimeout()

      await cameraRef.current?.pausePreview()
      setScanState('linking')

      try {
        const response = await api.device.link.mutate({
          payload: { token },
        })

        if (response.error)
          return Alert.alert(
            t('link.dialog.error.title'),
            t('link.dialog.error.message'),
            [{ text: 'OK', onPress: resetScan }]
          )

        await queryClient.invalidateQueries({
          queryKey: api.device.me.getQueryKey(),
        })

        Alert.alert(
          t('link.dialog.success.title'),
          t('link.dialog.success.message'),
          [{ text: 'OK', onPress: () => router.push('/(tabs)/pill-boxes') }]
        )
      } catch (error) {
        Alert.alert(
          t('link.dialog.error.title'),
          error instanceof Error
            ? error.message
            : t('link.dialog.error.message'),
          [{ text: 'OK', onPress: resetScan }]
        )
      }
    },
    [
      t,
      router,
      api.device.link,
      api.device.me,
      queryClient,
      clearScanTimeout,
      resetScan,
    ]
  )

  const handleStartScan = useCallback(async () => {
    if (scanState !== 'idle') return

    clearScanTimeout()

    isScannedRef.current = false

    await cameraRef.current?.resumePreview()
    setScanState('scanning')

    scanTimeoutRef.current = setTimeout(async () => {
      if (isScannedRef.current) return

      isScannedRef.current = true

      await cameraRef.current?.pausePreview()

      setScanState('linking')

      Alert.alert(t('link.scan_failed.title'), t('link.scan_failed.message'), [
        { text: 'OK', onPress: resetScan },
      ])
    }, 5000)
  }, [scanState, t, clearScanTimeout, resetScan])

  useEffect(() => () => clearScanTimeout(), [clearScanTimeout])

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

      {isBusy && (
        <View
          className='absolute inset-0 z-50 size-full items-center justify-center bg-black/50'
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
