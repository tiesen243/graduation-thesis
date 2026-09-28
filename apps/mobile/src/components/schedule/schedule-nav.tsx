import DateTimePicker from '@react-native-community/datetimepicker'
import { getCurrentWeekRange } from '@rozumari/lib/get-current-week-range'
import { Button } from '@rozumari/ui/components/button'
import { Typography } from '@rozumari/ui/components/typography'
import { cn, formatDate } from '@rozumari/ui/lib/utils'
import { Activity, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import { getTimezonedDate } from '@/lib/utils'

export const getAdjacentWeekRange = (
  currentStartDate: string,
  offsetDays: number
) => {
  const date = getTimezonedDate(currentStartDate)
  date.setDate(date.getDate() + offsetDays)
  return getCurrentWeekRange(date)
}

const STATUSES = [
  { key: 'index.statuses.completed', color: 'bg-success' },
  { key: 'index.statuses.pending', color: 'bg-warning' },
  { key: 'index.statuses.missed', color: 'bg-destructive' },
] as const

export const ScheduleNav: React.FC<{
  startDate: string
  endDate: string
  setWeek: (options: { startDate: string; endDate: string }) => void
}> = ({ startDate, endDate, setWeek }) => {
  const { t, i18n } = useTranslation('schedule')
  const [isOpen, setIsOpen] = useState(false)

  const weekRange = useMemo(() => {
    const isSameYear = startDate.split('-')[0] === endDate.split('-')[0]

    return `${formatDate(startDate, {
      mode: 'custom',
      custom: isSameYear ? 'MMM d' : 'MMM d, yyyy',
      locale: i18n.resolvedLanguage,
    })} – ${formatDate(endDate, {
      mode: 'custom',
      custom: 'MMM d, yyyy',
      locale: i18n.resolvedLanguage,
    })}`
  }, [startDate, endDate, i18n.resolvedLanguage])

  return (
    <View className='flex-row items-center justify-between gap-4 px-4 pt-4'>
      <View className='flex-row items-center gap-3'>
        {STATUSES.map((status) => (
          <View key={status.key} className='flex-row items-center gap-1.5'>
            <View className={cn('size-2 rounded-full', status.color)} />
            <Typography className='text-xs'>{t(status.key)}</Typography>
          </View>
        ))}
      </View>

      <Button variant='outline' onPress={() => setIsOpen(true)}>
        <Typography>{weekRange}</Typography>
      </Button>

      <Activity mode={isOpen ? 'visible' : 'hidden'}>
        <DateTimePicker
          value={getTimezonedDate(startDate)}
          onValueChange={(_, date) => {
            const _weekRange = getCurrentWeekRange(date)
            setWeek(_weekRange)
            setIsOpen(false)
          }}
          onDismiss={() => setIsOpen(false)}
          onNeutralButtonPress={() => setIsOpen(false)}
        />
      </Activity>
    </View>
  )
}
