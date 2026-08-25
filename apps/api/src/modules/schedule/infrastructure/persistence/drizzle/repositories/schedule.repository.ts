// oxlint-disable unicorn/no-array-for-each
import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleAggregate } from '@rozumari/contract/schedule/schemas/schedule.aggregate'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'

import { and, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { ScheduleItem } from '@/modules/schedule/domain/entities/schedule-item.entity'
import { Schedule } from '@/modules/schedule/domain/entities/schedule.entity'
import { ScheduleRepository } from '@/modules/schedule/domain/repositories/schedule.repository'
import { formatToday } from '@/modules/schedule/domain/utils/format-today'
import {
  scheduleItems,
  schedules,
} from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'
import { withTransaction } from '@/shared/utils'

export const DrizzleScheduleMapper = {
  toEntity: (entity: (typeof schedules)['$inferSelect']) =>
    Schedule.make({ ...entity }),
  toRow: structuredClone,
}

export const DrizzleScheduleItemMapper = {
  toEntity: (entity: (typeof scheduleItems)['$inferSelect']) =>
    ScheduleItem.make({ ...entity }),
  toRow: structuredClone,
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

    const itemsRepo = yield* makeDrizzleRepository(
      scheduleItems,
      [scheduleItems.scheduleId, scheduleItems.slot],
      DrizzleScheduleItemMapper
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
        limit,
        offset,
      }) {
        const subQuery = db
          .select({ id: schedules.id })
          .from(schedules)
          .where(
            deviceId
              ? and(
                  eq(schedules.userId, userId),
                  eq(schedules.deviceId, deviceId)
                )
              : eq(schedules.userId, userId)
          )
          .limit(limit)
          .offset(offset)
          .as('sq')

        const rows = yield* db
          .select()
          .from(schedules)
          .innerJoin(subQuery, eq(schedules.id, subQuery.id))
          .leftJoin(scheduleItems, eq(schedules.id, scheduleItems.scheduleId))
          .pipe(Effect.orDie)

        return groupJoinRows(rows)
      }),

      findByDevice: Effect.fn(function* findByDevice(deviceId: DeviceId) {
        const rows = yield* db
          .select()
          .from(schedules)
          .where(eq(schedules.deviceId, deviceId))
          .leftJoin(scheduleItems, eq(schedules.id, scheduleItems.scheduleId))
          .pipe(Effect.orDie)

        return groupJoinRows(rows)
      }),

      saveWithItems: Effect.fn(function* saveWithItems(schedule, items) {
        yield* schedulesRepo.save(schedule)
        yield* itemsRepo.save(items)
      }, withTransaction),

      findTodayByDevice: Effect.fn(function* findTodayByDevice(deviceId) {
        const today = formatToday()

        const rows = yield* db
          .select()
          .from(schedules)
          .where(
            and(eq(schedules.deviceId, deviceId), eq(schedules.date, today))
          )
          .leftJoin(scheduleItems, eq(schedules.id, scheduleItems.scheduleId))
          .pipe(Effect.orDie)

        return groupJoinRows(rows)
      }),

      deleteWithItems: Effect.fn(function* deleteWithItems(scheduleId) {
        yield* db
          .delete(scheduleItems)
          .where(eq(scheduleItems.scheduleId, scheduleId))
          .pipe(Effect.orDie)

        yield* db
          .delete(schedules)
          .where(eq(schedules.id, scheduleId))
          .pipe(Effect.orDie)
      }, withTransaction),
    }
  })
)
