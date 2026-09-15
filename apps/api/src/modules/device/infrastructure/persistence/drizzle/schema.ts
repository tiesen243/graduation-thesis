import type {
  DeviceId,
  DeviceStatus,
} from '@rozumari/contract/device/schemas/device.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { deviceStatuses } from '@rozumari/contract/device/schemas/device.schema'
import {
  index,
  pgEnum,
  primaryKey,
  snakeCase,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const deviceStatusEnum = pgEnum('device_status', deviceStatuses)

export const devices = snakeCase.table(
  'devices',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<DeviceId>(),
    userId: t
      .varchar({ length: 24 })
      .references(() => users.id, { onDelete: 'set null' })
      .$type<UserId>(),

    factoryModel: t.varchar({ length: 12 }).notNull(),
    status: deviceStatusEnum().notNull().$type<DeviceStatus>(),
    name: t.varchar({ length: 255 }),
    position: t.varchar({ length: 255 }),
    activatedAt: t.timestamp(),
  }),
  (t) => [
    uniqueIndex('devices_factory_model_index').on(t.factoryModel),
    index('devices_user_id_index').on(t.userId),
  ]
)

export const compartments = snakeCase.table(
  'compartments',
  (t) => ({
    deviceId: t
      .varchar({ length: 24 })
      .references(() => devices.id, { onDelete: 'cascade' })
      .notNull()
      .$type<DeviceId>(),
    position: t.varchar({ length: 3 }).notNull(),

    medicine: t.varchar({ length: 255 }),
    capacity: t.integer().notNull(),
    dosage: t.numeric({ precision: 8, scale: 2, mode: 'number' }).notNull(),
    lastRefillAt: t.timestamp(),
  }),
  (t) => [
    primaryKey({ columns: [t.deviceId, t.position] }),
    index('compartments_device_id_index').on(t.deviceId),
  ]
)
