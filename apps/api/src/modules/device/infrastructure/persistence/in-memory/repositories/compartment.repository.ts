import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { CompartmentRepository } from '@/modules/device/domain/repositories/compartment.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryCompartmentRepository = Layer.effect(
  CompartmentRepository,
  Effect.gen(function* InMemoryCompartmentRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.compartments,
      (entity) => `${entity.deviceId}:${entity.position}`
    )

    return {
      ...repository,
    }
  })
)
