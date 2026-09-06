import type { VariantProps } from 'class-variance-authority'
import type { LucideProps } from 'lucide-uniwind'

import { cva } from 'class-variance-authority'
import * as React from 'react'
import { View } from 'react-native'

import { cn } from '@/lib/utils'
import { Typography, TypographyContext } from '@/native/typography'

const alertVariants = cva(
  'relative w-full rounded-lg border border-border bg-card p-3',
  {
    variants: {
      variant: {
        default: 'border-border',
        success: 'border-success/30 bg-success/10',
        destructive: 'border-destructive/30 bg-destructive/10',
        info: 'border-info/30 bg-info/10',
        warning: 'border-warning/30 bg-warning/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const textVariants = {
  default: 'text-card-foreground',
  success: 'text-success',
  destructive: 'text-destructive',
  info: 'text-info',
  warning: 'text-warning',
} as const

function Alert({
  className,
  variant = 'default',
  icon: Icon,
  children,
  ...props
}: React.ComponentProps<typeof View> &
  VariantProps<typeof alertVariants> & {
    icon?: React.FC<LucideProps>
  }) {
  return (
    <TypographyContext
      value={textVariants[variant as keyof typeof textVariants]}
    >
      <View
        data-slot='alert'
        accessibilityRole='alert'
        className={cn(
          'flex-row items-start gap-3',
          alertVariants({ variant }),
          !Icon && 'flex-col',
          className
        )}
        {...props}
      >
        {Icon ? (
          <>
            <Icon
              className={cn(
                textVariants[variant as keyof typeof textVariants],
                'size-4'
              )}
            />
            <View className='flex-1 gap-3'>{children}</View>
          </>
        ) : (
          children
        )}
      </View>
    </TypographyContext>
  )
}

function AlertTitle({
  className,
  children,
  ...props
}: React.ComponentProps<typeof View>) {
  const style = 'text-base leading-none font-semibold tracking-tight'

  if (typeof children === 'string')
    return (
      <Typography data-slot='alert-title' className={cn(style, className)}>
        {children}
      </Typography>
    )

  return (
    <TypographyContext value={style}>
      <View data-slot='alert-title' className={className} {...props}>
        {children}
      </View>
    </TypographyContext>
  )
}

function AlertDescription({
  className,
  children,
  ...props
}: React.ComponentProps<typeof View>) {
  const style = 'text-sm text-balance text-muted-foreground'

  if (typeof children === 'string') {
    return (
      <Typography
        data-slot='alert-description'
        className={cn(style, className)}
      >
        {children}
      </Typography>
    )
  }

  return (
    <TypographyContext value={style}>
      <View data-slot='alert-description' className={className} {...props}>
        {children}
      </View>
    </TypographyContext>
  )
}

function AlertAction({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      data-slot='alert-action'
      className={cn('ml-auto self-start', className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
