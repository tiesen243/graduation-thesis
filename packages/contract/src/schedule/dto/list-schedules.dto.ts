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
    startDate: Schema.Date,
    endDate: Schema.Date,
  })
  export type Input = typeof Input.Type

  export const Output = ListSchedulesDto.fields.data
  export type Output = typeof Output.Type
}
