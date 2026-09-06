import * as Schema from 'effect/Schema'

import { NotificationSchema as NotificationSchemaType } from '@/notification/schemas/notification.schema'

export const NotificationSchema = Schema.Struct({
  id: NotificationSchemaType.fields.id,
  title: NotificationSchemaType.fields.title,
  body: NotificationSchemaType.fields.body,
  level: NotificationSchemaType.fields.level,
  createdAt: NotificationSchemaType.fields.createdAt,
})
