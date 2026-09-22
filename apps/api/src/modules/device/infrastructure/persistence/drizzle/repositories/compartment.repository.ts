import { sql } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { CompartmentRepository } from '@/modules/device/application/ports/compartment.repository'
import { DrizzleCompartmentMapper } from '@/modules/device/infrastructure/persistence/drizzle/mappers/compartment.mapper'
import { compartments } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleCompartmentRepository = Layer.effect(
  CompartmentRepository,
  Effect.gen(function* DrizzleCompartmentRepository() {
    const { db } = yield* DrizzleClient
    const primaryKey = [compartments.deviceId, compartments.position]

    const repository = yield* makeDrizzleRepository(
      compartments,
      [compartments.deviceId, compartments.position],
      DrizzleCompartmentMapper
    )

    return {
      ...repository,

      save: Effect.fn(function* save(entity) {
        if (Array.isArray(entity)) {
          if (entity.length === 0) return

          return yield* db
            .insert(compartments)
            .values(entity.map(DrizzleCompartmentMapper.toRow))
            .onConflictDoUpdate({
              target: primaryKey,
              set: {
                capacity: sql`excluded.capacity`,
              },
            })
            .pipe(Effect.asVoid, Effect.orDie)
        }

        const row = DrizzleCompartmentMapper.toRow(entity)
        return yield* db
          .insert(compartments)
          .values(row)
          .onConflictDoUpdate({ target: primaryKey, set: row })
          .pipe(Effect.asVoid, Effect.orDie)
      }),
    }
  })
)
