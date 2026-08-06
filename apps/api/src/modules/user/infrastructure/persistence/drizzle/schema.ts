import type {
  UserId,
  UserRole,
} from '@rozumari/contract/user/schemas/user.schema'

import { userRoles } from '@rozumari/contract/user/schemas/user.schema'
import { pgEnum, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', userRoles)

export const users = snakeCase.table(
  'users',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey().$type<UserId>(),
    username: t.varchar({ length: 20 }).notNull(),
    email: t.varchar({ length: 255 }).notNull(),
    role: userRole().notNull().$type<UserRole>(),
    image: t.varchar({ length: 255 }),

    createdAt: t.timestamp({ mode: 'date' }).notNull(),
    updatedAt: t.timestamp({ mode: 'date' }).notNull(),
    deletedAt: t.timestamp({ mode: 'date' }),
  }),
  (t) => [
    uniqueIndex('users_username_uq_idx').on(t.username),
    uniqueIndex('users_email_uq_idx').on(t.email),
  ]
)
