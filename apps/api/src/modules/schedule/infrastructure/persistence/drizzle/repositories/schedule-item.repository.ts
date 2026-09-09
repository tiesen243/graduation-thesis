import { sql } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { DrizzleScheduleItemMapper } from '@/modules/schedule/infrastructure/persistence/drizzle/mappers/schedule-item.mapper'
import { scheduleItems } from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleScheduleItemRepository = Layer.effect(
  ScheduleItemRepository,
  Effect.gen(function* DrizzleScheduleItemRepository() {
    const { db } = yield* DrizzleClient
    const primaryKey = [scheduleItems.scheduleId, scheduleItems.slot]

    const repository = yield* makeDrizzleRepository(
      scheduleItems,
      primaryKey,
      DrizzleScheduleItemMapper
    )

    return {
      ...repository,

      save: Effect.fn(function* save(entity) {
        if (Array.isArray(entity)) {
          if (entity.length === 0) return

          return yield* db
            .insert(scheduleItems)
            .values(entity.map(DrizzleScheduleItemMapper.toRow))
            .onConflictDoUpdate({
              target: primaryKey,
              set: { quantity: sql`excluded.quantity` },
            })
            .pipe(Effect.asVoid, Effect.orDie)
        }

        const row = DrizzleScheduleItemMapper.toRow(entity)

        return yield* db
          .insert(scheduleItems)
          .values(row)
          .onConflictDoUpdate({ target: primaryKey, set: row })
          .pipe(Effect.asVoid, Effect.orDie)
      }),
    }
  })
)
