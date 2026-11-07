import { eq } from 'drizzle-orm'
import * as Effect from 'effect/Effect'

import { chatStateSubscriptions } from '@/modules/ai/infrastructure/persistence/drizzle/schema'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

interface MessengerThread {
  id: string
  startTyping: () => Promise<unknown>
  post: (message: string) => Promise<unknown>
}

const unlinkUser = Effect.fn(function* imp(threadId: string) {
  const { db } = yield* DrizzleClient

  const [subscription] = yield* db
    .update(chatStateSubscriptions)
    .set({ userId: null })
    .where(eq(chatStateSubscriptions.threadId, threadId))
    .returning({ threadId: chatStateSubscriptions.threadId })

  return Boolean(subscription)
})

export const unlinkHandler = async (thread: MessengerThread) => {
  await thread.startTyping()

  const linked = await unlinkUser(thread.id).pipe(
    Effect.provide(DrizzleClient.layer),
    Effect.runPromise
  )

  await thread.post(
    linked
      ? 'Your account has been successfully linked!'
      : 'User not found or this thread is not subscribed.'
  )
}
