import type { DateType } from 'react-native-calendars-datepicker'

import { formatDate } from '@rozumari/ui/lib/utils'
import { useCallback } from 'react'
import CalendarPicker, {
  useDefaultClassNames,
} from 'react-native-calendars-datepicker'

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
        ? formatDate(dates.startDate.toString())
        : ''
      const rawEnd = dates.endDate ? formatDate(dates.endDate.toString()) : ''

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
          onStartDateChange(selected)
          onEndDateChange(startDate)
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
            new Date(selected).getTime() - new Date(startDate).getTime()
          )
          const endDiff = Math.abs(
            new Date(selected).getTime() - new Date(endDate).getTime()
          )

          if (startDiff <= endDiff) onStartDateChange(selected)
          else onEndDateChange(selected)
        }
      }
    },
    [startDate, endDate, onStartDateChange, onEndDateChange]
  )

  return (
    <CalendarPicker
      mode='range'
      firstDayOfWeek={1}
      startDate={startDate ? new Date(startDate) : undefined}
      endDate={endDate ? new Date(endDate) : undefined}
      onChange={handleRangePress}
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
