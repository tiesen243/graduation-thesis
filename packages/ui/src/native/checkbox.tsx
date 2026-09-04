import type { GestureResponderEvent } from 'react-native'

import { CheckIcon } from 'lucide-react-native'
import * as React from 'react'
import { Pressable, View } from 'react-native'

import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<
  React.ComponentProps<typeof Pressable>,
  'children'
> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

function Checkbox({
  className,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  ...props
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked)

  const isControlled = checkedProp !== undefined
  const checked = isControlled ? checkedProp : internalChecked

  const handlePress = (e: GestureResponderEvent) => {
    if (disabled) return

    const nextChecked = !checked
    if (!isControlled) {
      setInternalChecked(nextChecked)
    }
    onCheckedChange?.(nextChecked)
    props.onPress?.(e)
  }

  return (
    <Pressable
      data-slot='checkbox'
      accessibilityRole='checkbox'
      accessibilityState={{ checked, disabled: disabled ?? false }}
      aria-checked={checked}
      aria-disabled={disabled ?? false}
      disabled={disabled}
      onPress={handlePress}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md border border-input bg-background transition-colors',
        checked && 'border-primary bg-primary text-primary-foreground',
        disabled && 'opacity-50',
        className
      )}
      {...props}
    >
      {checked && (
        <View
          data-slot='checkbox-indicator'
          className='items-center justify-center'
        >
          <CheckIcon size={14} color='#FAFAFA' />
        </View>
      )}
    </Pressable>
  )
}

export { Checkbox }
