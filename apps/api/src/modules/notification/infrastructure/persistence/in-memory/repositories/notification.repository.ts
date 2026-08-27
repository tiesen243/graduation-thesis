import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { NotificationRepository } from '@/modules/notification/domain/repositories/notification.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryNotificationRepository = Layer.effect(
  NotificationRepository,
  Effect.gen(function* DrizzleNotificationRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.notifications,
      (entity) => entity.id
    )

    return {
      ...repository,
    }
  })
)
