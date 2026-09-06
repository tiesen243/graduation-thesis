import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'

import { DeviceRepository } from '@/modules/device/application/ports/device.repository'
import { DeviceCompartmentsAggregate } from '@/modules/device/domain/entities/device-compartments.aggregate'
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

      findWithCompartment: Effect.fn(function* findWithCompartment(deviceId) {
        const [device] = yield* repository.findMany({
          where: { id: { eq: deviceId } },
          limit: 1,
        })
        if (!device) return null

        const compartments = yield* Ref.get(db.compartments).pipe(
          Effect.map((dict) =>
            [...dict.values()].filter((c) => c.deviceId === deviceId)
          )
        )
        if (compartments.length === 0) return null

        return DeviceCompartmentsAggregate.make({
          device,
          compartments,
        })
      }),
    }
  })
)
