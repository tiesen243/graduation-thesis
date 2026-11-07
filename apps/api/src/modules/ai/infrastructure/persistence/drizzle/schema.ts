import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { index, primaryKey, snakeCase } from 'drizzle-orm/pg-core'

import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const chatStateSubscriptions = snakeCase.table(
  'chat_state_subscriptions',
  (t) => ({
    keyPrefix: t.text().notNull(),
    threadId: t.text().notNull(),
    userId: t
      .varchar({ length: 24 })
      .references(() => users.id, { onDelete: 'cascade' })
      .$type<UserId>(),
    createdAt: t.timestamp().notNull().defaultNow(),
  }),
  (t) => [primaryKey({ columns: [t.keyPrefix, t.threadId] })]
)

export const chatStateLocks = snakeCase.table(
  'chat_state_locks',
  (t) => ({
    keyPrefix: t.text().notNull(),
    threadId: t.text().notNull(),
    token: t.text().notNull(),
    expiresAt: t.timestamp().notNull(),
    updatedAt: t.timestamp().notNull().defaultNow(),
  }),
  (t) => [
    primaryKey({ columns: [t.keyPrefix, t.threadId] }),
    index('chat_state_locks_expires_idx').on(t.expiresAt),
  ]
)

export const chatStateCache = snakeCase.table(
  'chat_state_cache',
  (t) => ({
    keyPrefix: t.text().notNull(),
    cacheKey: t.text().notNull(),
    value: t.text().notNull(),
    expiresAt: t.timestamp(),
    updatedAt: t.timestamp().notNull().defaultNow(),
  }),
  (t) => [
    primaryKey({ columns: [t.keyPrefix, t.cacheKey] }),
    index('chat_state_cache_expires_idx').on(t.expiresAt),
  ]
)

export const chatStateLists = snakeCase.table(
  'chat_state_lists',
  (t) => ({
    keyPrefix: t.text().notNull(),
    listKey: t.text().notNull(),
    seq: t
      .bigserial({
        mode: 'number',
      })
      .notNull(),
    value: t.text().notNull(),
    expiresAt: t.timestamp(),
  }),
  (t) => [
    primaryKey({ columns: [t.keyPrefix, t.listKey, t.seq] }),
    index('chat_state_lists_expires_idx').on(t.expiresAt),
  ]
)

export const chatStateQueues = snakeCase.table(
  'chat_state_queues',
  (t) => ({
    keyPrefix: t.text().notNull(),
    threadId: t.text().notNull(),
    seq: t
      .bigserial({
        mode: 'number',
      })
      .notNull(),
    value: t.text().notNull(),
    expiresAt: t.timestamp().notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.keyPrefix, t.threadId, t.seq] }),
    index('chat_state_queues_expires_idx').on(t.expiresAt),
  ]
)
