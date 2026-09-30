import type {
  BarcodeScanningResult,
  CameraView as ICameraView,
} from 'expo-camera'

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

type ScanState = 'idle' | 'linking'

interface QrBounds {
  x: number
  y: number
  width: number
  height: number
}

export default function TabsPillBoxesLinkScreen() {
  const { t } = useTranslation('pill-box')

  const queryClient = useQueryClient()
  const { api } = useRuntime()
  const router = useRouter()

  const [scanState, setScanState] = useState<ScanState>('idle')
  const [qrBounds, setQrBounds] = useState<QrBounds | null>(null)

  const cameraRef = useRef<ICameraView>(null)
  const scannedTokenRef = useRef<string | null>(null)
  const boundsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleBarcodeScanned = useCallback((result: BarcodeScanningResult) => {
    if (result.bounds)
      setQrBounds({ ...result.bounds.origin, ...result.bounds.size })
    scannedTokenRef.current = result.data

    if (boundsTimeoutRef.current) clearTimeout(boundsTimeoutRef.current)
    boundsTimeoutRef.current = setTimeout(() => {
      setQrBounds(null)
      scannedTokenRef.current = null
    }, 500)
  }, [])

  const handleStartLink = useCallback(async () => {
    if (scanState !== 'idle') return

    const token = scannedTokenRef.current
    if (!token)
      return Alert.alert(
        t('link.dialog.error.title'),
        t('link.dialog.error.no_qr')
      )

    setScanState('linking')
    await cameraRef.current?.pausePreview()

    try {
      await api.device.link.mutate({ payload: { token } })
      await queryClient.invalidateQueries({
        queryKey: api.device.me.getQueryKey(),
      })

      Alert.alert(
        t('link.dialog.success.title'),
        t('link.dialog.success.message'),
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch (error) {
      Alert.alert(
        t('link.dialog.error.title'),
        error instanceof Error ? error.message : t('link.dialog.error.message')
      )
    } finally {
      await cameraRef.current?.resumePreview()
      setScanState('idle')
    }
  }, [api.device.link, api.device.me, queryClient, router, scanState, t])

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
          scanState === 'idle' ? handleBarcodeScanned : undefined
        }
      />

      {qrBounds && !isBusy && (
        <View
          pointerEvents='none'
          style={{
            position: 'absolute',
            left: qrBounds.x - 8,
            top: qrBounds.y - 8,
            width: qrBounds.width + 16,
            height: qrBounds.height + 16,
          }}
          className='rounded-sm border-2 border-warning bg-warning/20'
        />
      )}

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
              onPress={handleStartLink}
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
