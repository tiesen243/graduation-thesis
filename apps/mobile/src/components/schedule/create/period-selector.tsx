import type { DateType } from 'react-native-calendars-datepicker'

import dayjs from 'dayjs'
import { getCalendars } from 'expo-localization'
import { useCallback } from 'react'
import CalendarPicker, {
  useDefaultClassNames,
} from 'react-native-calendars-datepicker'

const [{ timeZone }] = getCalendars()

export const PeriodSelector: React.FC<{
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}> = ({ startDate, endDate, onEndDateChange, onStartDateChange }) => {
  const classNames = useDefaultClassNames()

  const handleRangePress = useCallback(
    // oxlint-disable-next-line complexity
    (dates: { startDate: DateType; endDate: DateType }) => {
      const rawStart = dates.startDate
        ? dayjs(dates.startDate).format('YYYY-MM-DD')
        : ''
      const rawEnd = dates.endDate
        ? dayjs(dates.endDate).format('YYYY-MM-DD')
        : ''

      let selected = ''
      if (rawStart !== startDate && rawStart) selected = rawStart
      else if (rawEnd !== endDate && rawEnd) selected = rawEnd
      else selected = rawStart || rawEnd

      if (!selected) return

      // Case 1: Both startDate and endDate are not set
      if (!startDate && !endDate) {
        onStartDateChange(selected)
        onEndDateChange('')
        return
      }

      // Case 2: Only startDate is set, endDate is not set
      if (startDate && !endDate) {
        if (selected === startDate) onStartDateChange('')
        else if (selected > startDate) onEndDateChange(selected)
        else {
          onEndDateChange(startDate)
          onStartDateChange(selected)
        }

        return
      }

      // Case 3: Both startDate and endDate are set
      if (startDate && endDate) {
        if (selected === startDate) {
          // Case 3a: Selected is start -> Unset start and shift end to start
          onStartDateChange(endDate)
          onEndDateChange('')
        } else if (selected === endDate) {
          // Case 3b: Selected is end -> Unset end
          onEndDateChange('')
        } else if (selected < startDate) {
          // Case 3c. Selected is less than start -> Expand the range to the left
          onStartDateChange(selected)
        } else if (selected > endDate) {
          // Case 3d. Selected is greater than end -> Expand the range to the right
          onEndDateChange(selected)
        } else {
          // Case 3e. Selected is between start and end -> Determine which end to move based on proximity
          const startDiff = Math.abs(
            dayjs(selected).diff(dayjs(startDate), 'day')
          )
          const endDiff = Math.abs(dayjs(selected).diff(dayjs(endDate), 'day'))

          if (startDiff <= endDiff) onStartDateChange(selected)
          else onEndDateChange(selected)
        }
      }
    },
    [startDate, endDate, onStartDateChange, onEndDateChange]
  )

  return (
    <CalendarPicker
      calendar='gregory'
      mode='range'
      startDate={startDate ? new Date(startDate) : undefined}
      endDate={endDate ? new Date(endDate) : undefined}
      onChange={handleRangePress}
      timeZone={timeZone ?? 'UTC'}
      classNames={{
        ...classNames,
        range_start: 'rounded-r-none',
        range_fill: 'bg-accent',
        range_middle: 'bg-accent rounded-none',
        range_middle_label: 'text-accent-foreground',
        range_end: 'rounded-l-none',
      }}
    />
  )
}
