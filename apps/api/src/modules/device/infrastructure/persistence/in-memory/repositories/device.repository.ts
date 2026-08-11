import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { DeviceRepository } from '@/modules/device/domain/repositories/device.repository'
import { makeInMemoryRepository } from '@/shared/infrastructure/persistence/in-memory/in-memory.repository'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'

export const InMemoryDeviceRepository = Layer.effect(
  DeviceRepository,
  Effect.gen(function* InMemoryDeviceRepository() {
    const { db } = yield* InMemoryClient
    const repository = yield* makeInMemoryRepository(
      db.devices,
      (entity) => entity.id
    )

    return {
      ...repository,
    }
  })
)
