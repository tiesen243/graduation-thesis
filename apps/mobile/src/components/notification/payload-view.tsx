import { Badge } from '@rozumari/ui/components/badge'
import { Typography } from '@rozumari/ui/components/typography'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

interface DropFailureItem {
  slot: string
  medicine: string
  quantity: number
}

interface DropPayload {
  required_failures?: DropFailureItem[]
  optional_failures?: DropFailureItem[]
  [key: string]: unknown
}

const FailureList: React.FC<{
  items: DropFailureItem[]
  title: string
  variant: 'destructive' | 'warning'
}> = ({ title, items, variant }) => {
  const { t } = useTranslation()

  return (
    <View className='gap-2'>
      <Typography
        className={`text-xs font-bold ${variant === 'destructive' ? 'text-destructive' : 'text-warning'}`}
      >
        {title} ({items.length})
      </Typography>
      <View className='gap-2'>
        {items.map((item, index) => (
          <View
            key={`${item.slot}-${index}`}
            className='flex-row items-center justify-between rounded-md border border-border/50 bg-background p-2.5'
          >
            <View className='flex-1 gap-0.5'>
              <Typography className='text-sm font-semibold text-foreground'>
                {item.medicine ?? `${t('slot')} ${item.slot}`}
              </Typography>
              {item.medicine && (
                <Typography className='text-xs text-muted-foreground'>
                  {t('slot')}: {item.slot}
                </Typography>
              )}
            </View>
            <Badge variant='outline'>
              <Typography className='text-xs font-medium'>
                x{item.quantity}
              </Typography>
            </Badge>
          </View>
        ))}
      </View>
    </View>
  )
}

export function PayloadView(props: { payload: Record<string, unknown> }) {
  const { t } = useTranslation('notification')

  const payload = props.payload as DropPayload
  const hasRequiredFailures =
    Array.isArray(payload.required_failures) &&
    payload.required_failures.length > 0
  const hasOptionalFailures =
    Array.isArray(payload.optional_failures) &&
    payload.optional_failures.length > 0

  if (hasRequiredFailures || hasOptionalFailures) {
    return (
      <View className='gap-4'>
        {hasRequiredFailures && (
          <FailureList
            items={payload.required_failures ?? []}
            title={t('required')}
            variant='destructive'
          />
        )}
        {hasOptionalFailures && (
          <FailureList
            items={payload.optional_failures ?? []}
            title={t('optional')}
            variant='warning'
          />
        )}
      </View>
    )
  }

  return (
    <View className='gap-2 rounded-lg bg-muted/50 p-3'>
      {Object.entries(payload).map(([key, value]) => (
        <View key={key} className='flex-row justify-between gap-4'>
          <Typography className='text-xs font-semibold text-muted-foreground capitalize'>
            {key.split('_').join(' ')}:
          </Typography>
          <Typography
            className='flex-1 text-right text-xs text-foreground'
            selectable
          >
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </Typography>
        </View>
      ))}
    </View>
  )
}
