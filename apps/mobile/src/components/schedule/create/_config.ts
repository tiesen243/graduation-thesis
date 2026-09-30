import { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'

import { getTimezonedDate } from '@/lib/utils'

export const CreateScheduleForm = FormBuilder.empty
  .add('deviceId', CreateScheduleDto.Input.fields.deviceId)
  .add('startDate', CreateScheduleDto.Input.fields.startDate)
  .add('endDate', CreateScheduleDto.Input.fields.endDate)
  .add('daysOfWeek', CreateScheduleDto.Input.fields.daysOfWeek)
  .add('time', CreateScheduleDto.Input.fields.time)
  .add('items', CreateScheduleDto.Input.fields.items)
  .make()

export const DAYS_OF_WEEK = [
  { value: 2, label: 'daysOfWeeks.mon' },
  { value: 3, label: 'daysOfWeeks.tue' },
  { value: 4, label: 'daysOfWeeks.wed' },
  { value: 5, label: 'daysOfWeeks.thu' },
  { value: 6, label: 'daysOfWeeks.fri' },
  { value: 7, label: 'daysOfWeeks.sat' },
  { value: 1, label: 'daysOfWeeks.sun' },
] as const

export const DAYS_OF_WEEK_MAP = Object.fromEntries(
  DAYS_OF_WEEK.map((d) => [d.value, d.label])
)

export const getMarkedDates = (
  start?: string,
  end?: string,
  color = '#3b82f6',
  textColor = '#ffffff'
) => {
  if (!start) return {}

  if (!end || start === end)
    return {
      [start]: { startingDay: true, endingDay: true, color, textColor },
    }

  const marked: Record<
    string,
    {
      startingDay?: boolean
      endingDay?: boolean
      color: string
      textColor: string
    }
  > = {}
  const currentDate = getTimezonedDate(start)
  const lastDate = getTimezonedDate(end)

  while (currentDate.getTime() <= lastDate.getTime()) {
    const [dateString = ''] = currentDate.toISOString().split('t')

    if (dateString === start)
      marked[dateString] = { startingDay: true, color, textColor }
    else if (dateString === end)
      marked[dateString] = { endingDay: true, color, textColor }
    else marked[dateString] = { color, textColor }

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return marked
}
