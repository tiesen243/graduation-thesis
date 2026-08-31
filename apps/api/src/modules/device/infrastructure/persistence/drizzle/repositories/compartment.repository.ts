import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'
import { DrizzleCompartmentMapper } from '@/modules/device/infrastructure/persistence/drizzle/mappers/compartment.mapper'
import { compartments } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleCompartmentRepository = Layer.effect(
  CompartmentRepository,
  Effect.gen(function* DrizzleCompartmentRepository() {
    const repository = yield* makeDrizzleRepository(
      compartments,
      [compartments.deviceId, compartments.position],
      DrizzleCompartmentMapper
    )

    return {
      ...repository,
    }
  })
)
