import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import { chatStateSubscriptions } from '@/modules/ai/infrastructure/persistence/drizzle/schema'
import { users } from '@/modules/user/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

interface MessengerThread {
  id: string
  startTyping: () => Promise<unknown>
  post: (message: string) => Promise<unknown>
}

const linkUser = Effect.fn(function* imp(threadId: string, userId: UserId) {
  const { db } = yield* DrizzleClient

  const [user] = yield* db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return false

  const [subscription] = yield* db
    .update(chatStateSubscriptions)
    .set({ userId })
    .where(eq(chatStateSubscriptions.threadId, threadId))
    .returning({ threadId: chatStateSubscriptions.threadId })

  return Boolean(subscription)
})

export const linkHandler = async (
  thread: MessengerThread,
  rawUserId: string
) => {
  if (!rawUserId || /\s/u.test(rawUserId)) {
    await thread.post('Usage: /link {userId}')
    return
  }

  await thread.startTyping()

  const linked = await linkUser(thread.id, rawUserId as UserId).pipe(
    Effect.provide(DrizzleClient.layer),
    Effect.runPromise
  )

  await thread.post(
    linked
      ? 'Your account has been successfully linked!'
      : 'User not found or this thread is not subscribed.'
  )
}
