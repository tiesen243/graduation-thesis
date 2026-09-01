import type { DeviceId } from '@rozumari/contract/device/schemas/device.schema'
import type {
  NotificationId,
  NotificationLevel,
} from '@rozumari/contract/notification/schemas/notification.schema'
import type { ScheduleId } from '@rozumari/contract/schedule/schemas/schedule.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { notificationLevels } from '@rozumari/contract/notification/schemas/notification.schema'
import { index, pgEnum, snakeCase } from 'drizzle-orm/pg-core'

import { devices } from '@/modules/device/infrastructure/persistence/drizzle/schema'
import { schedules } from '@/modules/schedule/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const notificationLevelEnum = pgEnum(
  'notification_level',
  notificationLevels
)

export const notifications = snakeCase.table(
  'notifications',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<NotificationId>(),
    userId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .$type<UserId>(),
    deviceId: t
      .varchar({ length: 24 })
      .references(() => devices.id, { onDelete: 'set null' })
      .$type<DeviceId>(),
    scheduleId: t
      .varchar({ length: 24 })
      .references(() => schedules.id, { onDelete: 'set null' })
      .$type<ScheduleId>(),

    level: notificationLevelEnum().notNull().$type<NotificationLevel>(),

    title: t.varchar({ length: 255 }).notNull(),
    body: t.text().notNull(),
    payload: t.jsonb(),

    readAt: t.timestamp(),

    createdAt: t.timestamp().notNull(),
  }),
  (t) => [
    index('notifications_user_id_created_at_idx').on(
      t.userId,
      t.createdAt.desc()
    ),
    index('notifications_user_id_read_at_idx').on(t.userId, t.readAt),
    index('notifications_schedule_id_idx').on(t.scheduleId),
  ]
)
