import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { ScheduleItemId } from '@rozumari/contract/schedule/schemas/schedule-item.schema'

import { eq, sql } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import {
  Schedule,
  ScheduleItem,
} from '@/modules/schedule/domain/entities/schedule.entity'
import {
  ScheduleRepository,
  type ScheduleWithItems,
} from '@/modules/schedule/domain/repositories/schedule.repository'
import {
  scheduleItems,
  schedules,
} from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

const DAY_OF_WEEK = () => new Date().getDay()

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
      scheduleItems.id,
      DrizzleScheduleItemMapper
    )

    const withItemsFor = Effect.fn(function* withItemsFor(
      scheduleId: ScheduleId
    ): Effect.Effect<ScheduleWithItems> {
      const [schedule] = yield* schedulesRepo.findMany({
        where: { id: { eq: scheduleId } },
        limit: 1,
      })
      const items = yield* itemsRepo.findMany({
        where: { scheduleId: { eq: scheduleId } },
      })
      return { schedule: schedule!, items }
    })

    return {
      findMany: schedulesRepo.findMany,

      count: schedulesRepo.count,

      findWithItems: Effect.fn(function* findWithItems(scheduleId) {
        const [schedule] = yield* schedulesRepo.findMany({
          where: { id: { eq: scheduleId } },
          limit: 1,
        })
        if (!schedule) return null
        const items = yield* itemsRepo.findMany({
          where: { scheduleId: { eq: scheduleId } },
        })
        return { schedule, items }
      }),

      findByDevice: Effect.fn(function* findByDevice(deviceId: DeviceId) {
        const schedulesList = yield* schedulesRepo.findMany({
          where: { deviceId: { eq: deviceId } },
        })
        return yield* Effect.forEach(
          schedulesList,
          (s) => withItemsFor(s.id),
          { concurrency: 'unbounded' }
        )
      }),

      saveWithItems: Effect.fn(function* saveWithItems(schedule, items) {
        yield* schedulesRepo.save(schedule)
        yield* itemsRepo.save(items)
      }),

      findTodayByDevice: Effect.fn(function* findTodayByDevice(deviceId) {
        const today = DAY_OF_WEEK()
        const [rows] = yield* db
          .select({
            schedule: schedules,
            items: sql<
              (typeof scheduleItems.$inferSelect)[]
            >`COALESCE(
              json_agg(
                json_build_object(
                  'id', ${scheduleItems.id},
                  'scheduleId', ${scheduleItems.scheduleId},
                  'slot', ${scheduleItems.slot},
                  'quantity', ${scheduleItems.quantity}
                ) ORDER BY ${scheduleItems.slot} ASC
              ) FILTER (WHERE ${scheduleItems.scheduleId} IS NOT NULL),
            '[]'::json)`.as('items'),
          })
          .from(schedules)
          .where(eq(schedules.deviceId, deviceId))
          .leftJoin(
            scheduleItems,
            eq(scheduleItems.scheduleId, schedules.id)
          )
          .groupBy(schedules.id)
          .pipe(Effect.orDie)

        const result: ScheduleWithItems[] = []
        for (const row of rows) {
          if (!row.schedule.daysOfWeek.includes(today)) continue
          result.push({
            schedule: Schedule.make({ ...row.schedule }),
            items: row.items.map((item) => ScheduleItem.make({ ...item })),
          })
        }
        return result
      }),

      deleteWithItems: Effect.fn(function* deleteWithItems(scheduleId) {
        const [schedule] = yield* schedulesRepo.findMany({
          where: { id: { eq: scheduleId } },
          limit: 1,
        })
        if (schedule) yield* schedulesRepo.delete(schedule)

        const items = yield* itemsRepo.findMany({
          where: { scheduleId: { eq: scheduleId } },
        })
        for (const item of items) yield* itemsRepo.delete(item)
      }),
    }
  })
)
