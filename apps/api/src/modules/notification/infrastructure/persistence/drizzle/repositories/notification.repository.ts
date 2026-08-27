import { NotificationSchema } from '@rozumari/contract/notification/schemas/notification.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Notification } from '@/modules/notification/domain/entities/notification.entity'
import { NotificationRepository } from '@/modules/notification/domain/repositories/notification.repository'
import { notifications } from '@/modules/notification/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleNotificationMapper: DrizzleMapper<
  Notification,
  NotificationSchema
> = {
  toEntity: (entity) => Notification.make(entity),
  toRow: encodeSync(NotificationSchema) as never,
}

export const DrizzleNotificationRepository = Layer.effect(
  NotificationRepository,
  Effect.gen(function* DrizzleNotificationRepository() {
    const repository = yield* makeDrizzleRepository(
      notifications,
      notifications.id,
      DrizzleNotificationMapper
    )

    return {
      ...repository,
    }
  })
)
