import type { CompartmentSchema } from '@rozumari/contract/device/schemas/compartment.schema'

import { CompartmentId } from '@rozumari/contract/device/schemas/compartment.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { Compartment } from '@/modules/device/domain/entities/compartment.entity'
import { CompartmentRepository } from '@/modules/device/domain/repositories/compartment.repository'
import { compartments } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleCompartmentMapper = {
  toEntity: (entity: typeof CompartmentSchema.Type) =>
    Compartment.make({
      ...entity,
      id: CompartmentId.make(entity.id),
    }),
  toRow: structuredClone,
}

export const DrizzleCompartmentRepository = Layer.effect(
  CompartmentRepository,
  Effect.gen(function* DrizzleCompartmentRepository() {
    const repository = yield* makeDrizzleRepository(
      compartments,
      compartments.id,
      DrizzleCompartmentMapper
    )

    return {
      ...repository,
    }
  })
)
