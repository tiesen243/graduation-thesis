import { Typography } from '@rozumari/ui/components/typography'
import { ActivityIndicator, View } from 'react-native'

export type ScanState = 'idle' | 'scanning' | 'processing' | 'linking'

interface ScanOverlayProps {
  scanState: ScanState
}

export function ScanOverlay({ scanState }: ScanOverlayProps) {
  if (scanState === 'idle') return null

  const getOverlayText = () => {
    switch (scanState) {
      case 'processing':
        return 'QR detected, processing...'
      case 'linking':
        return 'Linking device...'
      default:
        return 'Scanning QR code...'
    }
  }

  return (
    <View
      className='inset-0 z-50 size-full items-center justify-center bg-black/50'
      pointerEvents='none'
    >
      <ActivityIndicator size='large' colorClassName='accent-white' />
      <Typography className='mt-3 text-base font-semibold text-white'>
        {getOverlayText()}
      </Typography>
    </View>
  )
}
