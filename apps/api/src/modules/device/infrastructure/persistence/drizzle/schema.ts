import type { CompartmentId } from '@rozumari/contract/device/schemas/compartment.schema'
import type {
  DeviceId,
  DeviceStatus,
} from '@rozumari/contract/device/schemas/device.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { deviceStatuses } from '@rozumari/contract/device/schemas/device.schema'
import { index, pgEnum, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const deviceStatusEnum = pgEnum('device_status', deviceStatuses)

export const devices = snakeCase.table(
  'devices',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<DeviceId>(),
    factoryModel: t.varchar({ length: 12 }).notNull(),
    status: deviceStatusEnum().notNull().$type<DeviceStatus>(),
    name: t.varchar({ length: 255 }),
    position: t.varchar({ length: 255 }),
    activatedAt: t.timestamp(),
    userId: t
      .varchar({ length: 24 })
      .references(() => users.id, { onDelete: 'set null' })
      .$type<UserId>(),
  }),
  (t) => [
    uniqueIndex('devices_factory_model_index').on(t.factoryModel),
    index('devices_user_id_index').on(t.userId),
  ]
)

export const compartments = snakeCase.table(
  'compartments',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<CompartmentId>(),
    medicine: t.varchar({ length: 255 }),
    capacity: t.integer().notNull(),
    maxCapacity: t.integer().notNull(),
    position: t.varchar({ length: 4 }).notNull(),
    lastRefillAt: t.timestamp(),
    deviceId: t
      .varchar({ length: 24 })
      .references(() => devices.id, { onDelete: 'cascade' })
      .notNull()
      .$type<DeviceId>(),
  }),
  (t) => [index('compartments_device_id_index').on(t.deviceId)]
)
