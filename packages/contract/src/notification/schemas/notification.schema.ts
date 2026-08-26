import * as DateTime from 'effect/DateTime'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import { ScheduleId } from '@/schedule/schemas/schedule.schema'
import { Cuid2 } from '@/schema'
import { UserId } from '@/user/schemas/user.schema'

export const NotificationId = Cuid2.pipe(
  Schema.brand('notification/domain/NotificationId')
)
export type NotificationId = typeof NotificationId.Type

export const notificationLevels = ['info', 'warning', 'error'] as const
export const NotificationLevel = Schema.Literals(notificationLevels).pipe(
  Schema.brand('notification/domain/NotificationLevel')
)
export type NotificationLevel = typeof NotificationLevel.Type

export const NotificationSchema = Schema.Struct({
  id: NotificationId,
  userId: UserId,
  sheduleId: Schema.NullOr(ScheduleId),

  level: NotificationLevel.pipe(
    Schema.withConstructorDefault(Effect.succeed('info'))
  ),

  title: Schema.String,
  body: Schema.String,
  payload: Schema.NullOr(Schema.Record(Schema.String, Schema.Unknown)),

  readAt: Schema.NullOr(Schema.Date).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),

  createdAt: Schema.Date.pipe(
    Schema.withConstructorDefault(DateTime.nowAsDate)
  ),
})
export type Notification = typeof NotificationSchema.Type
