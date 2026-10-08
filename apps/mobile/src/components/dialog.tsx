// oxlint-disable react/refs
import type { GestureResponderEvent } from 'react-native'

import { Button } from '@rozumari/ui/components/button'
import {
  Typography,
  TypographyContext,
} from '@rozumari/ui/components/typography'
import { cn } from '@rozumari/ui/lib/utils'
import * as React from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.25
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.75

interface DialogContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  translateY: Animated.Value
  sheetHeight: Animated.Value & { __getValue: () => number }
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

const useDialogContext = () => {
  const context = React.use(DialogContext)
  if (!context)
    throw new Error('useDialogContext must be used within a DialogProvider')
  return context
}

function Dialog({
  children,
  open,
  onOpenChange,
}: Readonly<{
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const _setOpen = isControlled ? onOpenChange : setInternalOpen

  const translateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const sheetHeight = React.useRef(new Animated.Value(MIN_SHEET_HEIGHT)).current

  const setOpen = React.useCallback(
    (_open: boolean) => {
      if (_open) {
        _setOpen(true)

        return Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }).start()
      }

      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start(() => _setOpen(false))
    },
    [_setOpen, translateY]
  )

  const memoizedValue = React.useMemo(
    () => ({
      open: isOpen,
      setOpen,
      translateY,
      sheetHeight: sheetHeight as Animated.Value & { __getValue: () => number },
    }),
    [isOpen, setOpen, translateY, sheetHeight]
  )

  return (
    <DialogContext data-slot='dialog' value={memoizedValue}>
      {children}
    </DialogContext>
  )
}

function DialogTrigger({
  onPress,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setOpen } = useDialogContext()

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      onPress?.(event)
      setOpen(true)
    },
    [onPress, setOpen]
  )

  return <Button data-slot='dialog-trigger' onPress={handlePress} {...props} />
}

function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Modal>) {
  const { open, setOpen, sheetHeight, translateY } = useDialogContext()

  return (
    <Modal
      data-slot='select-content'
      animationType='none'
      visible={open}
      onRequestClose={() => setOpen(false)}
      transparent
      {...props}
    >
      <TouchableWithoutFeedback onPress={() => setOpen(false)}>
        <KeyboardAvoidingView
          behavior='padding'
          className='inset-0 z-50 flex-1 justify-end bg-black/10 dark:bg-black/50'
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={{
                height: sheetHeight,
                maxHeight: MAX_SHEET_HEIGHT,
                transform: [{ translateY }],
              }}
              className={cn(
                'w-full gap-4 rounded-t-xl bg-popover p-4 pt-0 ring-1 ring-foreground/20',
                className
              )}
            >
              <TypographyContext value='text-sm text-popover-foreground'>
                {children}
              </TypographyContext>
            </Animated.View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

function DialogClose({
  onPress,
  variant = 'outline',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { setOpen } = useDialogContext()

  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      onPress?.(event)
      setOpen(false)
    },
    [onPress, setOpen]
  )

  return (
    <Button
      data-slot='dialog-close'
      variant={variant}
      onPress={handlePress}
      {...props}
    />
  )
}

function DialogHeader({
  className,
  ...props
}: React.ComponentProps<typeof View>) {
  const { setOpen, translateY, sheetHeight } = useDialogContext()

  const startHeight = React.useRef(MIN_SHEET_HEIGHT)
  const isExpanded = React.useRef(false)

  const drag = React.useRef(new Animated.Value(0)).current

  const animateIndicator = React.useCallback(
    (dragging: boolean) =>
      Animated.timing(drag, {
        toValue: dragging ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start(),
    [drag]
  )

  const scaleX = drag.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  })

  const opacity = drag.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  })

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,

      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,

      onPanResponderGrant: () => {
        animateIndicator(true)

        startHeight.current = sheetHeight.__getValue()
        isExpanded.current = startHeight.current >= MAX_SHEET_HEIGHT - 10
      },

      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState

        if (!isExpanded.current) {
          if (dy < 0) {
            translateY.setValue(0)
            const newHeight = Math.min(MAX_SHEET_HEIGHT, MIN_SHEET_HEIGHT - dy)
            return sheetHeight.setValue(newHeight)
          }

          return translateY.setValue(dy)
        }

        translateY.setValue(0)

        if (dy < 0) {
          const overdrag = Math.abs(dy) / 3
          return sheetHeight.setValue(MAX_SHEET_HEIGHT + overdrag)
        }

        sheetHeight.setValue(Math.max(MIN_SHEET_HEIGHT, MAX_SHEET_HEIGHT - dy))
      },

      onPanResponderRelease: (_, gestureState) => {
        animateIndicator(false)

        const { dy, vy } = gestureState
        const expandDistance = MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT

        if (!isExpanded.current) {
          if (dy >= 0) {
            if (dy > 80 || vy > 0.5) return setOpen(false)

            return Animated.spring(translateY, {
              toValue: 0,
              bounciness: 4,
              useNativeDriver: false,
            }).start()
          }

          const targetHeight =
            Math.abs(dy) > expandDistance * 0.5 || vy < -0.5
              ? MAX_SHEET_HEIGHT
              : MIN_SHEET_HEIGHT

          return Animated.spring(sheetHeight, {
            toValue: targetHeight,
            bounciness: 4,
            useNativeDriver: false,
          }).start()
        }

        if (dy < 0)
          return Animated.spring(sheetHeight, {
            toValue: MAX_SHEET_HEIGHT,
            bounciness: 6,
            useNativeDriver: false,
          }).start()

        const targetHeight =
          dy > expandDistance * 0.3 || vy > 0.3
            ? MIN_SHEET_HEIGHT
            : MAX_SHEET_HEIGHT

        Animated.spring(sheetHeight, {
          toValue: targetHeight,
          bounciness: 4,
          useNativeDriver: false,
        }).start()
      },

      onPanResponderTerminate: () => animateIndicator(false),
    })
  ).current

  return (
    <View
      data-slot='dialog-header'
      {...panResponder.panHandlers}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      <View className='items-center justify-center pt-3 pb-2'>
        <Animated.View
          style={{
            transform: [{ scaleX }],
            opacity,
          }}
          className='h-1.5 w-16 rounded-full bg-muted-foreground'
        />
      </View>

      {props.children}
    </View>
  )
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      data-slot='dialog-footer'
      className={cn('flex flex-row justify-end gap-2', className)}
      {...props}
    >
      {children}
    </View>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      data-slot='dialog-title'
      className={cn(
        'font-heading text-base leading-none font-medium',
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof Typography>) {
  return (
    <Typography
      data-slot='dialog-description'
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
