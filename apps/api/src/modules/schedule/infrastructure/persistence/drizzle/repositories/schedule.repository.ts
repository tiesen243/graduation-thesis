import type { ScheduleAggregateSchema } from '@rozumari/contract/schedule/schemas/schedule.aggregate'
import type { ScheduleStatus } from '@rozumari/contract/schedule/schemas/schedule.schema'

import { and, asc, between, eq, ne, sql, sum } from 'drizzle-orm'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import {
  compartments,
  devices,
} from '@/modules/device/infrastructure/persistence/drizzle/schema'
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
      userId: schedules.userId,
      device: {
        id: devices.id,
        name: devices.name,
        position: devices.position,
      },
      items: sql<ScheduleAggregateSchema['items']>`COALESCE(
        json_agg(json_build_object(
          'slot', ${scheduleItems.slot},
          'medicine', ${compartments.medicine},
          'dosage', ${compartments.dosage},
          'quantity', ${scheduleItems.quantity},
          'isRequired', ${scheduleItems.isRequired}
        )) FILTER (WHERE ${scheduleItems.slot} IS NOT NULL),
      '[]'::json)`,
    }

    return {
      ...schedulesRepo,

      findWithItems: Effect.fn(function* findWithItems(scheduleId) {
        const [row] = yield* db
          .select(selector)
          .from(schedules)
          .innerJoin(scheduleItems, eq(scheduleItems.scheduleId, schedules.id))
          .innerJoin(devices, eq(devices.id, schedules.deviceId))
          .leftJoin(
            compartments,
            and(
              eq(compartments.deviceId, schedules.deviceId),
              eq(compartments.position, scheduleItems.slot)
            )
          )
          .where(eq(schedules.id, scheduleId))
          .groupBy(schedules.id, devices.id)
          .orderBy(asc(schedules.date), asc(schedules.time))
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
          .innerJoin(scheduleItems, eq(scheduleItems.scheduleId, schedules.id))
          .innerJoin(devices, eq(devices.id, schedules.deviceId))
          .leftJoin(
            compartments,
            and(
              eq(compartments.deviceId, schedules.deviceId),
              eq(compartments.position, scheduleItems.slot)
            )
          )
          .where(and(...conditions))
          .groupBy(schedules.id, devices.id)
          .orderBy(asc(schedules.date), asc(schedules.time))
          .pipe(Effect.orDie)

        return rows
      }),

      findManyPendingByDeviceId: Effect.fn(function* findManyPendingByDeviceId({
        deviceId,
        excludeScheduleId,
      }) {
        const rows = yield* db
          .select({
            slot: scheduleItems.slot,
            quantity: sum(scheduleItems.quantity).mapWith(Number),
          })
          .from(schedules)
          .innerJoin(scheduleItems, eq(scheduleItems.scheduleId, schedules.id))
          .where(
            and(
              eq(schedules.deviceId, deviceId),
              eq(schedules.status, 'pending' as ScheduleStatus),
              excludeScheduleId
                ? ne(schedules.id, excludeScheduleId)
                : undefined
            )
          )
          .groupBy(scheduleItems.slot)
          .pipe(Effect.orDie)

        return rows.map((row) => ({
          slot: row.slot,
          quantity: row.quantity ?? 0,
        }))
      }),
    }
  })
)
