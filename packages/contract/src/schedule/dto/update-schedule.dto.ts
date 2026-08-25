import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export class UpdateScheduleDto extends Schema.TaggedClass<UpdateScheduleDto>()(
  'schedule/application/UpdateScheduleDto',
  ApiResponse({
    message: 'Update schedule successfully',
    dataSchema: Schema.Struct({
      schedule: ScheduleSchema,
      items: Schema.Array(ScheduleItemSchema),
    }),
  })
) {}

export namespace UpdateScheduleDto {
  export const Params = Schema.Struct({
    id: ScheduleSchema.fields.id,
  })
  export type Params = typeof Params.Type

  export const Input = Schema.Struct({
    date: ScheduleSchema.fields.date.pipe(Schema.optionalKey),
    time: ScheduleSchema.fields.time.pipe(Schema.optionalKey),
    status: ScheduleSchema.fields.status.pipe(Schema.optionalKey),
    items: Schema.Array(
      Schema.Struct({
        slot: ScheduleItemSchema.fields.slot,
        quantity: ScheduleItemSchema.fields.quantity,
      })
    ).pipe(Schema.optionalKey),
  })
  export type Input = typeof Input.Type

  export const Output = UpdateScheduleDto.fields.data
  export type Output = typeof Output.Type
}
