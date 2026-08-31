import type { ScheduleAggregate } from '@rozumari/contract/schedule/schemas/schedule.aggregate'

import { and, between, eq, sql } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { compartments } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { ScheduleRepository } from '@/modules/schedule/application/ports/schedule.repository'
import { DrizzleScheduleMapper } from '@/modules/schedule/infrastructure/persistence/drizzle/mappers/schedule.mapper'
import {
  scheduleItems,
  schedules,
} from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { makeDrizzleRepository } from '@/shared/infrastructure/persistence/drizzle/drizzle.repository'

export const DrizzleScheduleRepository = Layer.effect(
  ScheduleRepository,
  Effect.gen(function* DrizzleScheduleRepository() {
    const { db } = yield* DrizzleClient

    const schedulesRepo = yield* makeDrizzleRepository(
      schedules,
      schedules.id,
      DrizzleScheduleMapper
    )

    const selector = {
      id: schedules.id,
      date: schedules.date,
      time: schedules.time,
      status: schedules.status,
      items: sql<ScheduleAggregate['items']>`COALESCE(
        json_agg(json_build_object(
          'slot', ${scheduleItems.slot},
          'medicine', ${compartments.medicine},
          'quantity', ${scheduleItems.quantity}
        )) FILTER (WHERE ${scheduleItems.slot} IS NOT NULL),
      '[]'::json)`,
    }

    return {
      ...schedulesRepo,

      findWithItems: Effect.fn(function* findWithItems(scheduleId) {
        const [row] = yield* db
          .select(selector)
          .from(schedules)
          .leftJoin(scheduleItems, eq(scheduleItems.scheduleId, schedules.id))
          .leftJoin(
            compartments,
            and(
              eq(compartments.deviceId, schedules.deviceId),
              eq(compartments.position, scheduleItems.slot)
            )
          )
          .where(eq(schedules.id, scheduleId))
          .groupBy(schedules.id)
          .pipe(Effect.orDie)

        return row ?? null
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

        const rows = yield* db
          .select(selector)
          .from(schedules)
          .leftJoin(scheduleItems, eq(scheduleItems.scheduleId, schedules.id))
          .leftJoin(
            compartments,
            and(
              eq(compartments.deviceId, schedules.deviceId),
              eq(compartments.position, scheduleItems.slot)
            )
          )
          .where(and(...conditions))
          .groupBy(schedules.id)
          .pipe(Effect.orDie)

        return rows
      }),
    }
  })
)
