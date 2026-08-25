import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export class CreateScheduleDto extends Schema.TaggedClass<CreateScheduleDto>()(
  'schedule/application/CreateScheduleDto',
  ApiResponse({
    message: 'Create schedule successfully',
    dataSchema: Schema.Struct({
      schedule: ScheduleSchema,
      items: Schema.Array(ScheduleItemSchema),
    }),
  })
) {}

export namespace CreateScheduleDto {
  export const Input = Schema.Struct({
    deviceId: ScheduleSchema.fields.deviceId,
    date: ScheduleSchema.fields.date,
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
