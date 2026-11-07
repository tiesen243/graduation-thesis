import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { jsonSchema, tool } from 'ai'
import { and, eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import { devices } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

const getDeviceListSchema = jsonSchema<object>({
  type: 'object',
})

const getDeviceInfoSchema = jsonSchema<{
  deviceId: DeviceId
}>({
  type: 'object',
  properties: {
    deviceId: { type: 'string' },
  },
  required: ['deviceId'],
})

export const createDeviceTools = (userId: UserId) => ({
  getDeviceList: tool({
    description: 'Get the linked user device list',
    inputSchema: getDeviceListSchema,
    execute: () =>
      Effect.gen(function* execute() {
        const { db } = yield* DrizzleClient

        return yield* db
          .select()
          .from(devices)
          .where(eq(devices.userId, userId))
      }).pipe(Effect.provide(DrizzleClient.layer), Effect.runPromise),
  }),

  getDeviceInfo: tool({
    description: 'Get information about a specific device',
    inputSchema: getDeviceInfoSchema,
    execute: ({ deviceId }) =>
      Effect.gen(function* execute() {
        const { db } = yield* DrizzleClient

        const [device] = yield* db
          .select()
          .from(devices)
          .where(and(eq(devices.userId, userId), eq(devices.id, deviceId)))
          .limit(1)

        return device ?? null
      }).pipe(Effect.provide(DrizzleClient.layer), Effect.runPromise),
  }),
})
