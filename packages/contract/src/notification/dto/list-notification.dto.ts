import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { NotificationSchema } from '@/notification/schemas/notification.schema'
import { ApiResponse, Pagination } from '@/schema'

export class ListNotificationDto extends Schema.TaggedClass<ListNotificationDto>()(
  'notification/application/ListNotificationDto',
  ApiResponse({
    message: 'List notification successfully',
    dataSchema: Schema.Struct({
      notifications: Schema.Array(NotificationSchema),
      meta: Pagination.Output,
    }),
  })
) {}

export namespace ListNotificationDto {
  export const Input = Pagination.Input.pipe(
    Schema.fieldsAssign({
      deviceId: Schema.optional(DeviceId),
    })
  )
  export type Input = typeof Input.Type

  export const Output = ListNotificationDto.fields.data
  export type Output = typeof Output.Type
}
