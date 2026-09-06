import * as Schema from 'effect/Schema'

import {
  NotificationId,
  NotificationLevel,
} from '@/notification/schemas/notification.schema'
import { ScheduleId } from '@/schedule/schemas/schedule.schema'
import { ApiResponse } from '@/schema'

export class CreateNotificationDto extends Schema.TaggedClass<CreateNotificationDto>()(
  'notification/application/CreateNotificationDto',
  ApiResponse({
    message: 'Create notification successfully',
    dataSchema: Schema.Struct({
      id: NotificationId,
    }),
  })
) {}

export namespace CreateNotificationDto {
  export const Input = Schema.Struct({
    scheduleId: Schema.NullOr(ScheduleId),

    level: NotificationLevel,

    title: Schema.String,
    body: Schema.String,

    payload: Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),
  })
  export type Input = typeof Input.Type

  export const Output = CreateNotificationDto.fields.data
  export type Output = typeof Output.Type
}
