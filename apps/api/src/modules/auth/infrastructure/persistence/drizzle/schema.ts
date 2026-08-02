import { index, primaryKey, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const accounts = snakeCase.table(
  'accounts',
  (t) => ({
    provider: t.varchar({ length: 24 }).notNull(),
    providerAccountId: t.varchar({ length: 24 }).notNull(),
    password: t.text(),

    userId: t
      .varchar({ length: 24 })
      .references(() => users.id)
      .notNull(),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index('accounts_user_id_idx').on(t.userId),
  ]
)

export const sessions = snakeCase.table(
  'sessions',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey(),
    token: t.varchar({ length: 64 }).notNull(),
    expiresAt: t.timestamp().notNull(),
    createdAt: t.timestamp().notNull(),

    userId: t
      .varchar({ length: 24 })
      .references(() => users.id)
      .notNull(),
  }),
  (t) => [
    uniqueIndex('sessions_token_uq_idx').on(t.token),
    index('sessions_user_id_idx').on(t.userId),
  ]
)
