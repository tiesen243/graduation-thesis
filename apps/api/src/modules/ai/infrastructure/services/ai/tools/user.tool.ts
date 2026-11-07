import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { jsonSchema, tool } from 'ai'
import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

const getUserInfoSchema = jsonSchema<object>({
  type: 'object',
})

export const createUserTools = (userId: UserId) => ({
  getUserInfo: tool({
    description: 'Get user info',
    inputSchema: getUserInfoSchema,
    execute: () =>
      Effect.gen(function* execute() {
        const { db } = yield* DrizzleClient

        const [user] = yield* db
          .select()
          .from(users)
          .where(eq(users.id, userId))

        return user
      }).pipe(Effect.provide(DrizzleClient.layer), Effect.runPromise),
  }),
})
