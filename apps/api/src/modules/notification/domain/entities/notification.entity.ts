import { NotificationSchema } from '@rozumari/contract/notification/schemas/notification.schema'
import { createId } from '@rozumari/lib/create-id'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export class Notification extends Schema.TaggedClass<Notification>()(
  'notification/domain/Notification',
  {
    ...NotificationSchema.fields,
    id: NotificationSchema.fields.id.pipe(
      Schema.withConstructorDefault(Effect.sync(createId))
    ),
  }
) {
  public markAsRead(now = new Date()): Notification {
    return new Notification({
      ...this,
      readAt: now,
    })
  }
}
