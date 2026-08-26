import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export const dayOfWeek = Schema.Int.check(
  Schema.isBetween(
    { minimum: 1, maximum: 7 },
    { message: 'Day of week must be between 1 (Sunday) and 7 (Saturday)' }
  )
)

export class CreateScheduleDto extends Schema.TaggedClass<CreateScheduleDto>()(
  'schedule/application/CreateScheduleDto',
  ApiResponse({
    message: 'Create schedule successfully',
    dataSchema: Schema.Array(
      Schema.Struct({
        schedule: ScheduleSchema,
        items: Schema.Array(ScheduleItemSchema),
      })
    ),
  })
) {}

export namespace CreateScheduleDto {
  const datePattern = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/u

  export const Input = Schema.Struct({
    deviceId: ScheduleSchema.fields.deviceId,
    startDate: Schema.String.check(
      Schema.isPattern(datePattern, {
        message: 'Start date must be in the format YYYY-MM-DD',
      })
    ),
    endDate: Schema.String.check(
      Schema.isPattern(datePattern, {
        message: 'End date must be in the format YYYY-MM-DD',
      })
    ),
    daysOfWeek: Schema.Array(dayOfWeek),
    time: ScheduleSchema.fields.time,
    items: Schema.Array(
      Schema.Struct({
        slot: ScheduleItemSchema.fields.slot,
        quantity: ScheduleItemSchema.fields.quantity,
      })
    ),
  }).check(
    Schema.makeFilter((data) => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const today = `${year}-${month}-${day}`

      if (data.startDate < today)
        return {
          path: ['startDate'],
          issue: 'Start date cannot be in the past',
        }

      if (data.endDate < data.startDate)
        return {
          path: ['endDate'],
          issue: 'End date cannot be before start date',
        }
    })
  )
  export type Input = typeof Input.Type

  export const Output = CreateScheduleDto.fields.data
  export type Output = typeof Output.Type
}
