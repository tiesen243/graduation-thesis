import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { jsonSchema, tool } from 'ai'
import { and, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import { compartments } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import {
  scheduleItems,
  schedules,
} from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

const formatTime = (value: string) => {
  const totalSeconds = Number(BigInt(value) / 1_000_000_000n)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, '0'))
    .join(':')
}

const getScheduleListSchema = jsonSchema<{
  deviceId: DeviceId | undefined
  date: string | undefined
}>({
  type: 'object',
  properties: {
    deviceId: { type: 'string' },
    date: { type: 'string', $comment: 'Format: YYYY-MM-DD' },
  },
  required: [],
})

const getScheduleInfoSchema = jsonSchema<{
  scheduleId: ScheduleId
}>({
  type: 'object',
  properties: {
    scheduleId: { type: 'string' },
  },
  required: ['scheduleId'],
})

export const createScheduleTools = (userId: UserId) => ({
  getScheduleList: tool({
    description: 'Get schedule list',
    inputSchema: getScheduleListSchema,
    execute: ({ deviceId, date }) =>
      Effect.gen(function* execute() {
        const { db } = yield* DrizzleClient

        const whereClause = [eq(schedules.userId, userId)]
        if (deviceId) whereClause.push(eq(schedules.deviceId, deviceId))
        if (date) whereClause.push(eq(schedules.date, date))

        const result = yield* db
          .select()
          .from(schedules)
          .where(and(...whereClause))

        return result.map(({ time, ...schedule }) => ({
          ...schedule,
          time: formatTime(time),
        }))
      }).pipe(Effect.provide(DrizzleClient.layer), Effect.runPromise),
  }),

  getScheduleInfo: tool({
    description: 'Get schedule info',
    inputSchema: getScheduleInfoSchema,
    execute: ({ scheduleId }) =>
      Effect.runPromise(
        Effect.gen(function* execute() {
          const { db } = yield* DrizzleClient

          const [schedule] = yield* db
            .select()
            .from(schedules)
            .innerJoin(
              scheduleItems,
              eq(schedules.id, scheduleItems.scheduleId)
            )
            .innerJoin(
              compartments,
              and(
                eq(compartments.deviceId, schedules.deviceId),
                eq(compartments.position, scheduleItems.slot)
              )
            )
            .where(
              and(
                eq(schedules.userId, userId),
                eq(schedules.id, scheduleId as never)
              )
            )
            .limit(1)

          if (!schedule) return null

          return {
            ...schedule,
            schedules: {
              ...schedule.schedules,
              time: formatTime(schedule.schedules.time),
            },
          }
        }).pipe(Effect.provide(DrizzleClient.layer))
      ),
  }),
})
