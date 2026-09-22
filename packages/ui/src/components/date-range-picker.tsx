import type { DateRange } from 'react-day-picker'

import { useCallback, useMemo } from 'react'

import { Button } from '@/components/button'
import { Calendar } from '@/components/calendar'
import { ChevronDownIcon } from '@/components/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover'
import { formatDate } from '@/lib/utils'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onChange: (range: { startDate: string; endDate: string }) => void
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const selectedRange: DateRange | undefined = useMemo(
    () => ({
      from: startDate ? new Date(startDate) : undefined,
      to: endDate ? new Date(endDate) : undefined,
    }),
    [startDate, endDate]
  )

  const handleSelect = useCallback(
    // oxlint-disable-next-line complexity
    (range: DateRange | undefined) => {
      const rawStart = range?.from ? formatDate(range.from) : ''
      const rawEnd = range?.to ? formatDate(range.to) : ''

      let selected = ''
      if (rawStart !== startDate && rawStart) selected = rawStart
      else if (rawEnd !== endDate && rawEnd) selected = rawEnd
      else selected = rawStart || rawEnd
      if (!selected) return

      // Case 1: Both startDate and endDate are not set
      if (!startDate && !endDate)
        return onChange({ startDate: selected, endDate: '' })

      // Case 2: Only startDate is set, endDate is not set
      if (startDate && !endDate) {
        if (selected === startDate) onChange({ startDate: '', endDate })
        else if (selected > startDate)
          onChange({ startDate, endDate: selected })
        else onChange({ startDate: selected, endDate: startDate })

        return
      }

      // Case 3: Both startDate and endDate are set
      if (startDate && endDate) {
        if (selected === startDate) {
          // Case 3a: Selected is start -> Unset start and shift end to start
          onChange({ startDate: endDate, endDate: '' })
        } else if (selected === endDate) {
          // Case 3b: Selected is end -> Unset end
          onChange({ startDate, endDate: '' })
        } else if (selected < startDate) {
          // Case 3c. Selected is less than start -> Expand the range to the left
          onChange({ startDate: selected, endDate })
        } else if (selected > endDate) {
          // Case 3d. Selected is greater than end -> Expand the range to the right
          onChange({ startDate, endDate: selected })
        } else {
          // Case 3e. Selected is between start and end -> Determine which end to move based on proximity
          const startDiff = Math.abs(
            new Date(selected).getTime() - new Date(startDate).getTime()
          )
          const endDiff = Math.abs(
            new Date(selected).getTime() - new Date(endDate).getTime()
          )

          if (startDiff <= endDiff) onChange({ startDate: selected, endDate })
          else onChange({ startDate, endDate: selected })
        }
      }
    },
    [startDate, endDate, onChange]
  )

  const label = useMemo(() => {
    if (selectedRange?.from && selectedRange?.to)
      return `${formatDate(selectedRange.from)} - ${formatDate(selectedRange.to)}`
    if (selectedRange?.from) return formatDate(selectedRange.from)
    return 'Pick a date range'
  }, [selectedRange])

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant='outline'
            data-empty={!startDate && !endDate}
            className='w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground'
          >
            {label}
            <ChevronDownIcon data-icon='inline-end' />
          </Button>
        }
      />
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={selectedRange}
          onSelect={handleSelect}
          numberOfMonths={2}
          defaultMonth={selectedRange?.from ?? new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}
