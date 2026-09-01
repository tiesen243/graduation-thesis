import { NotificationSchema } from '@rozumari/contract/notification/schemas/notification.schema'
import * as Schema from 'effect/Schema'

export class Notification extends Schema.TaggedClass<Notification>()(
  'notification/domain/Notification',
  NotificationSchema
) {
  public markAsRead(now = new Date()): Notification {
    return new Notification({
      ...this,
      readAt: now,
    })
  }
}
