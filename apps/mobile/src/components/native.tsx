import {
  ActivityIndicator as RNActivityIndicator,
  RefreshControl as RNRefreshControl,
} from 'react-native'

function ActivityIndicator({
  size = 'small',
  colorClassName = 'accent-primary',
  ...props
}: React.ComponentProps<typeof RNActivityIndicator>) {
  return (
    <RNActivityIndicator
      data-slot='indicator'
      colorClassName={colorClassName}
      size={size}
      {...props}
    />
  )
}

function RefreshControl({
  size = 'default',
  colorsClassName = 'accent-primary',
  progressBackgroundColorClassName = 'accent-popover',
  ...props
}: React.ComponentProps<typeof RNRefreshControl>) {
  return (
    <RNRefreshControl
      data-slot='refresh-control'
      size={size}
      colorsClassName={colorsClassName}
      progressBackgroundColorClassName={progressBackgroundColorClassName}
      {...props}
    />
  )
}

export { ActivityIndicator, RefreshControl }
