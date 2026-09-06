import * as Schema from 'effect/Schema'

import { DeviceId } from '@/device/schemas/device.schema'
import { NotificationSchema } from '@/notification/schemas/notification.schema'
import { ApiResponse, Pagination } from '@/schema'

export class ListNotificationsDto extends Schema.TaggedClass<ListNotificationsDto>()(
  'notification/application/ListNotificationsDto',
  ApiResponse({
    message: 'List notifications successfully',
    dataSchema: Schema.Struct({
      notifications: Schema.Array(
        Schema.Struct({
          id: NotificationSchema.fields.id,
          level: NotificationSchema.fields.level,
          title: NotificationSchema.fields.title,
          body: NotificationSchema.fields.body,
          readAt: NotificationSchema.fields.readAt,
          createdAt: NotificationSchema.fields.createdAt,
        })
      ),
      meta: Pagination.Output,
    }),
  })
) {}

export namespace ListNotificationsDto {
  export const Input = Pagination.Input.pipe(
    Schema.fieldsAssign({
      deviceId: Schema.optional(DeviceId),
    })
  )
  export type Input = typeof Input.Type

  export const Output = ListNotificationsDto.fields.data
  export type Output = typeof Output.Type
}
