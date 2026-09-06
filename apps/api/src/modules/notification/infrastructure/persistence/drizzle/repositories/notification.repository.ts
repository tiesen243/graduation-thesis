import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { NotificationRepository } from '@/modules/notification/application/ports/notification.repository'
import { DrizzleNotificationMapper } from '@/modules/notification/infrastructure/persistence/drizzle/mappers/notification.mapper'
import { notifications } from '@/modules/notification/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

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
