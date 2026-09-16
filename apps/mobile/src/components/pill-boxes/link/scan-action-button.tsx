import { Button } from '@rozumari/ui/components/button'
import { Card, CardContent } from '@rozumari/ui/components/card'
import { cn } from '@rozumari/ui/lib/utils'
import { View } from 'react-native'

interface ScanActionButtonProps {
  onPress: () => void
  disabled: boolean
}

export function ScanActionButton({ onPress, disabled }: ScanActionButtonProps) {
  return (
    <Card className='z-10 rounded-none pb-8'>
      <CardContent className='items-center justify-center p-0'>
        <View className='size-20 items-center justify-center rounded-full border-4 border-card-foreground/80 p-1'>
          <Button
            onPress={onPress}
            disabled={disabled}
            className={cn(
              'size-full rounded-full bg-card-foreground disabled:opacity-100',
              !disabled && 'active:scale-95'
            )}
          />
        </View>
      </CardContent>
    </Card>
  )
}
