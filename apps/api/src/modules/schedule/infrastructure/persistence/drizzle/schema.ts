import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type { ScheduleItemId } from '@rozumari/contract/schedule/schemas/schedule-item.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { index, primaryKey, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

import { devices } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const schedules = snakeCase.table(
  'schedules',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<ScheduleId>(),
    userId: t
      .varchar({ length: 24 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .$type<UserId>(),
    deviceId: t
      .varchar({ length: 24 })
      .references(() => devices.id, { onDelete: 'cascade' })
      .notNull()
      .$type<DeviceId>(),
    date: t.date().notNull(),
    time: t.varchar({ length: 5 }).notNull(),
    createdAt: t.timestamp().notNull(),
    updatedAt: t.timestamp().notNull(),
  }),
  (t) => [
    index('schedules_user_id_index').on(t.userId),
    index('schedules_device_id_index').on(t.deviceId),
  ]
)

export const scheduleItems = snakeCase.table(
  'schedule_items',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<ScheduleItemId>(),
    scheduleId: t
      .varchar({ length: 24 })
      .references(() => schedules.id, { onDelete: 'cascade' })
      .notNull()
      .$type<ScheduleId>(),
    slot: t.varchar({ length: 3 }).notNull(),
    quantity: t.integer().notNull(),
  }),
  (t) => [
    uniqueIndex('schedule_items_schedule_id_index').on(t.scheduleId),
    primaryKey({ columns: [t.id] }),
  ]
)
