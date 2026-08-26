import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { ScheduleAggregateSchema } from '@/schedule/schemas/schedule.aggregate'
import { ApiResponse } from '@/schema'

export class ListSchedulesDto extends Schema.TaggedClass<ListSchedulesDto>()(
  'schedule/application/ListSchedulesDto',
  ApiResponse({
    message: 'Get list of schedules successfully',
    dataSchema: Schema.Array(ScheduleAggregateSchema),
  })
) {}

export namespace ListSchedulesDto {
  export const Input = Schema.Struct({
    deviceId: Schema.optional(DeviceId),
    startDate: Schema.String.check(
      Schema.isPattern(
        /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/u,
        { message: 'startDate must be in the format YYYY-MM-DD' }
      )
    ),
    endDate: Schema.String.check(
      Schema.isPattern(
        /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])$/u,
        { message: 'endDate must be in the format YYYY-MM-DD' }
      )
    ),
  })
  export type Input = typeof Input.Type

  export const Output = ListSchedulesDto.fields.data
  export type Output = typeof Output.Type
}
