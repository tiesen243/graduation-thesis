import { snakeCase, uniqueIndex } from 'drizzle-orm/pg-core'

export const users = snakeCase.table(
  'users',
  (t) => ({
    id: t.varchar({ length: 24 }).primaryKey(),
    username: t.varchar({ length: 20 }).notNull(),
    email: t.varchar({ length: 255 }).notNull(),
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
