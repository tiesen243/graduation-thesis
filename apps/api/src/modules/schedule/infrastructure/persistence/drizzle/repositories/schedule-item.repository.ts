import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItemRepository } from '@/modules/schedule/application/ports/schedule-item.repository'
import { DrizzleScheduleItemMapper } from '@/modules/schedule/infrastructure/persistence/drizzle/mappers/schedule-item.mapper'
import { scheduleItems } from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

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
