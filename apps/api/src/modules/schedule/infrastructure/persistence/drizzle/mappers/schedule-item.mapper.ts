import { ScheduleItemSchema } from '@rozumari/contract/schedule/schemas/schedule-item.schema'
import { encodeSync } from 'effect/SchemaParser'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'

export const DrizzleScheduleItemMapper: DrizzleMapper<
  ScheduleItem,
  ScheduleItemSchema
> = {
  toEntity: (entity) => ScheduleItem.make(entity),
  toRow: encodeSync(ScheduleItemSchema) as never,
}
