import * as Schema from 'effect/Schema'

import {
  NotificationId,
  NotificationSchema,
} from '@/notification/schemas/notification.schema'
import { ApiResponse } from '@/schema'

export class ShowNotificationDto extends Schema.TaggedClass<ShowNotificationDto>()(
  'notification/application/ShowNotificationDto',
  ApiResponse({
    message: 'Show notification successfully',
    dataSchema: NotificationSchema,
  })
) {}

export namespace ShowNotificationDto {
  export const Input = Schema.Struct({
    id: NotificationId,
  })
  export type Input = typeof Input.Type

  export const Output = ShowNotificationDto.fields.data
  export type Output = typeof Output.Type
}
