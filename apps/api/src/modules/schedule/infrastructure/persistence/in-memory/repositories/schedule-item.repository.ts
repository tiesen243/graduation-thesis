import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryScheduleItemRepository = Layer.effect(
  ScheduleItemRepository,
  Effect.gen(function* DrizzleScheduleItemRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.scheduleItems,
      (entity) => `${entity.scheduleId}:${entity.slot}`
    )

    return {
      ...repository,
    }
  })
)
