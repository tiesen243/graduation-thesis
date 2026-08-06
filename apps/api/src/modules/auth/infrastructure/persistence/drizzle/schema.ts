import type {
  AccountProvider,
  AccountProviderId,
} from '@rozumari/contract/auth/schemas/account.schema'
import type { SessionId } from '@rozumari/contract/auth/schemas/session.schema'
import type { RefreshToken } from '@rozumari/contract/auth/schemas/token.schema'
import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { index, primaryKey, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'

export const accounts = snakeCase.table(
  'accounts',
  (t) => ({
    provider: t.varchar({ length: 255 }).notNull().$type<AccountProvider>(),
    providerId: t.varchar({ length: 255 }).notNull().$type<AccountProviderId>(),
    password: t.varchar({ length: 255 }),
    userId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .$type<UserId>(),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerId] }),
    index('accounts_user_id_idx').on(t.userId),
  ]
)

export const sessions = snakeCase.table(
  'sessions',
  (t) => ({
    id: t.varchar({ length: 24 }).notNull().primaryKey().$type<SessionId>(),
    token: t.varchar({ length: 64 }).notNull().$type<RefreshToken>(),
    expiresAt: t.timestamp({ mode: 'date' }).notNull(),
    userId: t
      .varchar({ length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .$type<UserId>(),
    createdAt: t.timestamp({ mode: 'date' }).notNull(),
  }),
  (t) => [uniqueIndex('sessions_token_uq_idx').on(t.token)]
)
