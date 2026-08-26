import { ScheduleItemSchema } from '@rozumari/contract/schedule/schemas/schedule-item.schema'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { ScheduleItemRepository } from '@/modules/schedule/domain/repositories/schedule-item.repository'
import { scheduleItems } from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleScheduleItemMapper: DrizzleMapper<
  ScheduleItem,
  ScheduleItemSchema
> = {
  toEntity: (entity) => ScheduleItem.make(entity),
  toRow: encodeSync(ScheduleItemSchema) as never,
}

export const DrizzleScheduleItemRepository = Layer.effect(
  ScheduleItemRepository,
  Effect.gen(function* DrizzleScheduleItemRepository() {
    const repository = yield* makeDrizzleRepository(
      scheduleItems,
      [scheduleItems.scheduleId, scheduleItems.slot],
      DrizzleScheduleItemMapper
    )

    return {
      ...repository,
    }
  })
)
