import * as Schema from 'effect/Schema'

import { ScheduleAggregateSchema } from '@/schedule/schemas/schedule.aggregate'
import { ApiResponse } from '@/schema'

export class TodayScheduleDto extends Schema.TaggedClass<TodayScheduleDto>()(
  'schedule/application/TodayScheduleDto',
  ApiResponse({
    message: 'Get today schedule successfully',
    dataSchema: Schema.Array(ScheduleAggregateSchema),
  })
) {}

export namespace TodayScheduleDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = TodayScheduleDto.fields.data
  export type Output = typeof Output.Type
}
