import type { VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'

import { cva } from 'class-variance-authority'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/lib/utils'
import { Button } from '@/native/button'
import { Input } from '@/native/input'

function InputGroup({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof View>) {
  return (
    <View
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role='group'
      className={cn(
        'relative h-10 w-full min-w-0 flex-row items-center rounded-lg border border-input bg-background transition-colors dark:bg-input/30',
        className
      )}
      {...props}
    />
  )
}

const inputGroupAddonVariants = cva(
  'cursor-pointer flex-row items-center justify-center gap-2 py-1.5 text-sm font-medium select-none',
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-2.5',
        'inline-end': 'order-last pr-2.5',
        'block-start': 'order-first w-full justify-start px-2.5 pt-2',
        'block-end': 'order-last w-full justify-start px-2.5 pb-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
)

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: ComponentPropsWithoutRef<typeof Pressable> &
  VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <Pressable
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role='group'
      className={cn(inputGroupAddonVariants({ align }), className)}
      {...props}
    />
  )
}

const inputGroupButtonVariants = cva(
  'flex-row items-center gap-2 text-sm shadow-none',
  {
    variants: {
      size: {
        xs: 'h-7 gap-1 rounded-md px-2',
        sm: 'h-8 px-2.5',
        'icon-xs': 'size-7 items-center justify-center rounded-md p-0',
        'icon-sm': 'size-8 items-center justify-center rounded-md p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  }
)

function InputGroupButton({
  className,
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<ComponentPropsWithoutRef<typeof Button>, 'size'> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Text>) {
  return (
    <Text
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof Input>) {
  return (
    <Input
      className={cn(
        'h-full flex-1 rounded-none border-0 bg-transparent px-2 shadow-none ring-0 focus:ring-0 dark:bg-transparent',
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
}
