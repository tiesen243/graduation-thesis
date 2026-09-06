import { NotificationSchema } from '@rozumari/contract/notification/schemas/notification.schema'
import { encodeSync } from 'effect/SchemaParser'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Notification } from '@/modules/notification/domain/entities/notification.entity'

export const DrizzleNotificationMapper: DrizzleMapper<
  Notification,
  NotificationSchema
> = {
  toEntity: (entity) => Notification.make(entity),
  toRow: encodeSync(NotificationSchema) as never,
}
