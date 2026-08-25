import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export class ShowScheduleDto extends Schema.TaggedClass<ShowScheduleDto>()(
  'schedule/application/ShowScheduleDto',
  ApiResponse({
    message: 'Get schedule successfully',
    dataSchema: Schema.Struct({
      schedule: ScheduleSchema,
      items: Schema.Array(ScheduleItemSchema),
    }),
  })
) {}

export namespace ShowScheduleDto {
  export const Input = Schema.Struct({
    id: ScheduleSchema.fields.id,
  })
  export type Input = typeof Input.Type

  export const Output = ShowScheduleDto.fields.data
  export type Output = typeof Output.Type
}
