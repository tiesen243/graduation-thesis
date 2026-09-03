import type { DateRange } from 'react-day-picker'

import { format } from 'date-fns'
import { useMemo } from 'react'

import { Button } from '@/components/button'
import { Calendar } from '@/components/calendar'
import { ChevronDownIcon } from '@/components/icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover'

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

  const handleSelect = (range: DateRange | undefined) => {
    const from = range?.from ? format(range.from, 'yyyy-MM-dd') : ''
    const to = range?.to ? format(range.to, 'yyyy-MM-dd') : ''
    onChange({ startDate: from, endDate: to })
  }

  const label = useMemo(() => {
    if (selectedRange?.from && selectedRange?.to) {
      return `${format(selectedRange.from, 'dd/MM/yyyy')} - ${format(selectedRange.to, 'dd/MM/yyyy')}`
    }
    if (selectedRange?.from) {
      return format(selectedRange.from, 'dd/MM/yyyy')
    }
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
