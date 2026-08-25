import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export const dayOfWeek = Schema.Int.check(
  Schema.isGreaterThanOrEqualTo(0, {
    message: 'Day of week must be greater than or equal to 0',
  }),
  Schema.isLessThanOrEqualTo(6, {
    message: 'Day of week must be less than or equal to 6',
  })
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
  export const Input = Schema.Struct({
    deviceId: ScheduleSchema.fields.deviceId,
    startDate: Schema.String.check(
      Schema.isPattern(
        /^(?<day>0[1-9]|[12][0-9]|3[01])\/(?<month>0[1-9]|1[0-2])\/\d{4}$/u,
        { message: 'Start date must be in dd/MM/yyyy format' }
      )
    ),
    endDate: Schema.String.check(
      Schema.isPattern(
        /^(?<day>0[1-9]|[12][0-9]|3[01])\/(?<month>0[1-9]|1[0-2])\/\d{4}$/u,
        { message: 'End date must be in dd/MM/yyyy format' }
      )
    ),
    daysOfWeek: Schema.Array(dayOfWeek),
    time: ScheduleSchema.fields.time,
    items: Schema.Array(
      Schema.Struct({
        slot: ScheduleItemSchema.fields.slot,
        quantity: ScheduleItemSchema.fields.quantity,
      })
    ),
  })
  export type Input = typeof Input.Type

  export const Output = CreateScheduleDto.fields.data
  export type Output = typeof Output.Type
}
