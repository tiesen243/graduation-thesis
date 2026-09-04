import type { VariantProps } from 'class-variance-authority'

import { cva } from 'class-variance-authority'
import { View } from 'react-native'

import { alertVariants } from '@/components/alert'
import { cn } from '@/lib/utils'
import { Typography, TypographyContext } from '@/native/typography'

const alertTextVariants = cva('text-left text-sm', {
  variants: {
    variant: {
      default: 'text-card-foreground',
      success: 'text-success',
      destructive: 'text-destructive',
      info: 'text-info',
      warning: 'text-warning',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof View> & VariantProps<typeof alertVariants>) {
  return (
    <TypographyContext value={cn(alertTextVariants({ variant }))}>
      <View
        data-slot='alert'
        role='alert'
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    </TypographyContext>
  )
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      data-slot='alert-title'
      className={cn('font-medium', className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      data-slot='alert-description'
      className={cn('text-sm text-balance text-muted-foreground', className)}
      {...props}
    />
  )
}

function AlertAction({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      data-slot='alert-action'
      className={cn('absolute top-2 right-2', className)}
      {...props}
    />
  )
}

export { alertVariants } from '@/components/alert'
export { Alert, AlertTitle, AlertDescription, AlertAction }
