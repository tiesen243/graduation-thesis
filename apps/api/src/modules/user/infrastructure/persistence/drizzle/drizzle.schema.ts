import { pgEnum, snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

import { User } from '@/modules/user/domain/entities/user.entity'

export const userRoles = pgEnum('user_roles', User.roles)

export const users = snakeCase.table(
  'users',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey(),
    username: t.varchar({ length: 20 }).notNull(),
    email: t.varchar({ length: 255 }).notNull(),
    role: userRoles().notNull(),
    image: t.varchar({ length: 255 }),
    createdAt: t.timestamp().notNull(),
    updatedAt: t.timestamp().notNull(),
    deletedAt: t.timestamp(),
  }),
  (t) => [
    uniqueIndex('users_username_uq_idx').on(t.username),
    uniqueIndex('users_email_uq_idx').on(t.email),
  ]
)
