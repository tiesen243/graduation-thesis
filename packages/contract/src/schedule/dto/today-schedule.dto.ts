import * as Schema from 'effect/Schema'

import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export class TodayScheduleDto extends Schema.TaggedClass<TodayScheduleDto>()(
  'schedule/application/TodayScheduleDto',
  ApiResponse({
    message: 'Get today schedule successfully',
    dataSchema: Schema.Struct({
      schedules: Schema.Array(
        Schema.Struct({
          schedule: ScheduleSchema,
          items: Schema.Array(ScheduleItemSchema),
        })
      ),
    }),
  })
) {}

export namespace TodayScheduleDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = TodayScheduleDto.fields.data
  export type Output = typeof Output.Type
}
