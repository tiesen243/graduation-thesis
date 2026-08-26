import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type {
  ScheduleId,
  ScheduleStatus,
} from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { scheduleStatuses } from '@rozumari/contract/schedule/schemas/schedule.schema'
import { index, pgEnum, primaryKey, snakeCase } from 'drizzle-orm/pg-core'

import { devices } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const scheduleStatusEnum = pgEnum('schedule_status', scheduleStatuses)

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
    time: t.time().notNull(),
    status: scheduleStatusEnum().notNull().$type<ScheduleStatus>(),
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
    scheduleId: t
      .varchar({ length: 24 })
      .references(() => schedules.id, { onDelete: 'cascade' })
      .notNull()
      .$type<ScheduleId>(),
    slot: t.varchar({ length: 3 }).notNull(),
    quantity: t.integer().notNull(),
  }),
  (t) => [primaryKey({ columns: [t.scheduleId, t.slot] })]
)
