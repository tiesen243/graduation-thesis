import { ScheduleSchema } from '@rozumari/contract/schedule/schemas/schedule.schema'
import { encodeSync } from 'effect/SchemaParser'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'

export const DrizzleScheduleMapper: DrizzleMapper<Schedule, ScheduleSchema> = {
  toEntity: (entity) =>
    Schedule.make({ ...entity, time: entity.time.slice(0, 5) }),
  toRow: encodeSync(ScheduleSchema) as never,
}
