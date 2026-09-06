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
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .$type<UserId>(),
    deviceId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' })
      .$type<DeviceId>(),

    date: t.date().notNull(),
    time: t.time().notNull(),
    status: scheduleStatusEnum().notNull().$type<ScheduleStatus>(),
  }),
  (t) => [
    index('schedules_user_id_index').on(t.userId),
    index('schedules_device_id_index').on(t.deviceId),

    index('schedules_user_id_date_index').on(t.userId, t.date),
    index('schedules_device_id_date_index').on(t.deviceId, t.date),
  ]
)

export const scheduleItems = snakeCase.table(
  'schedule_items',
  (t) => ({
    scheduleId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' })
      .$type<ScheduleId>(),
    slot: t.varchar({ length: 3 }).notNull(),
    quantity: t.integer().notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.scheduleId, t.slot] }),
    index('schedule_items_schedule_id_index').on(t.scheduleId),
  ]
)
