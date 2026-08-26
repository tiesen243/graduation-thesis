import type { ScheduleAggregate } from '@rozumari/contract/schedule/schemas/schedule.aggregate'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import { ScheduleSchema } from '@rozumari/contract/schedule/schemas/schedule.schema'
import { and, between, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import { encodeSync } from 'effect/Schema'

import type { DrizzleMapper } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'
import {
  scheduleItems,
  schedules,
} from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleScheduleMapper: DrizzleMapper<Schedule, ScheduleSchema> = {
  toEntity: (entity) =>
    Schedule.make({ ...entity, time: entity.time.slice(0, 5) }),
  toRow: encodeSync(ScheduleSchema) as never,
}

const groupJoinRows = (
  rows: {
    schedules: typeof schedules.$inferSelect
    schedule_items: typeof scheduleItems.$inferSelect | null
  }[]
): ScheduleAggregate[] => {
  const resultMap = new Map<ScheduleId, ScheduleAggregate>()
  for (const { schedules: schedule, schedule_items: _item } of rows) {
    let entry = resultMap.get(schedule.id)

    if (!entry) {
      entry = { ...schedule, items: [] }
      resultMap.set(schedule.id, entry)
    }

    if (_item) {
      const item = ScheduleItem.make(_item)
      ;(entry.items as ScheduleItem[]).push(item)
    }
  }

  return [...resultMap.values()]
}

export const DrizzleScheduleRepository = Layer.effect(
  ScheduleRepository,
  Effect.gen(function* DrizzleScheduleRepository() {
    const { db } = yield* DrizzleClient

    const schedulesRepo = yield* makeDrizzleRepository(
      schedules,
      schedules.id,
      DrizzleScheduleMapper
    )

    return {
      ...schedulesRepo,

      findWithItems: Effect.fn(function* findWithItems(scheduleId) {
        const rows = yield* db
          .select()
          .from(schedules)
          .where(eq(schedules.id, scheduleId))
          .leftJoin(scheduleItems, eq(schedules.id, scheduleItems.scheduleId))
          .pipe(Effect.orDie)

        if (rows.length === 0) return null

        const grouped = groupJoinRows(rows)
        return grouped[0] ?? null
      }),

      findManyWithItems: Effect.fn(function* findManyWithItems({
        userId,
        deviceId,
        startDate,
        endDate,
      }) {
        const conditions = []

        if (userId) conditions.push(eq(schedules.userId, userId))
        if (deviceId) conditions.push(eq(schedules.deviceId, deviceId))

        if (startDate === endDate)
          conditions.push(eq(schedules.date, startDate))
        else conditions.push(between(schedules.date, startDate, endDate))

        const subQuery = db
          .select({ id: schedules.id })
          .from(schedules)
          .where(and(...conditions))
          .as('sq')

        const rows = yield* db
          .select()
          .from(schedules)
          .innerJoin(subQuery, eq(schedules.id, subQuery.id))
          .leftJoin(scheduleItems, eq(schedules.id, scheduleItems.scheduleId))
          .pipe(Effect.orDie)

        return groupJoinRows(rows)
      }),
    }
  })
)
