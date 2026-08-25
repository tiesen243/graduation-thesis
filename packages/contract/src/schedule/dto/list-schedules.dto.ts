import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { ScheduleItemSchema } from '@/schedule/schemas/schedule-item.schema'
import { ScheduleSchema } from '@/schedule/schemas/schedule.schema'
import { ApiResponse, Pagination } from '@/schema'

export class ListSchedulesDto extends Schema.TaggedClass<ListSchedulesDto>()(
  'schedule/application/ListSchedulesDto',
  ApiResponse({
    message: 'Get list of schedules successfully',
    dataSchema: Schema.Struct({
      schedules: Schema.Array(
        Schema.Struct({
          schedule: ScheduleSchema,
          items: Schema.Array(ScheduleItemSchema),
        })
      ),
      meta: Pagination.Output,
    }),
  })
) {}

export namespace ListSchedulesDto {
  export const Input = Pagination.Input.pipe(
    Schema.fieldsAssign({
      deviceId: Schema.optional(DeviceId),
    })
  )
  export type Input = typeof Input.Type

  export const Output = ListSchedulesDto.fields.data
  export type Output = typeof Output.Type
}
