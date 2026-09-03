import { CreateScheduleDto } from '@rozumari/contract/schedule/dto/create-schedule.dto'
import { FormBuilder } from '@rozumari/ui/lib/form-builder'

export const CreateScheduleForm = FormBuilder.empty
  .add('deviceId', CreateScheduleDto.Input.fields.deviceId)
  .add('startDate', CreateScheduleDto.Input.fields.startDate)
  .add('endDate', CreateScheduleDto.Input.fields.endDate)
  .add('daysOfWeek', CreateScheduleDto.Input.fields.daysOfWeek)
  .add('time', CreateScheduleDto.Input.fields.time)
  .add('items', CreateScheduleDto.Input.fields.items)
  .make()

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Sunday' },
  { value: 2, label: 'Monday' },
  { value: 3, label: 'Tuesday' },
  { value: 4, label: 'Wednesday' },
  { value: 5, label: 'Thursday' },
  { value: 6, label: 'Friday' },
  { value: 7, label: 'Saturday' },
] as const

export const DAYS_OF_WEEK_MAP = Object.fromEntries(
  DAYS_OF_WEEK.map((d) => [d.value, d.label])
)
