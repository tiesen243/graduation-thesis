import { pgEnum, snakeCase } from 'drizzle-orm/pg-core'

import { userRoles } from '@/modules/user/domain/entities/user.entity'

export const userRolesEnum = pgEnum('user_roles', userRoles)

export const users = snakeCase.table('users', (t) => ({
  id: t.varchar({ length: 24 }).primaryKey(),
  username: t.varchar({ length: 20 }).notNull(),
  email: t.varchar({ length: 255 }).notNull(),
  image: t.varchar({ length: 255 }),
  role: userRolesEnum().notNull().default('user'),
  createdAt: t.timestamp().notNull(),
  updatedAt: t.timestamp().notNull(),
  deletedAt: t.timestamp(),
}))
