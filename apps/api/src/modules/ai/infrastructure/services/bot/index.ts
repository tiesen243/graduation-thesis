import { createMessengerAdapter } from '@chat-adapter/messenger'
import { createPostgresState } from '@chat-adapter/state-pg'
import { Chat } from 'chat'
import { eq } from 'drizzle-orm'
import { Effect } from 'effect'

import { chatStateSubscriptions } from '@/modules/ai/infrastructure/persistence/drizzle/schema'
import { parseCommand } from '@/modules/ai/infrastructure/services/bot/commands'
import { createAskHandler } from '@/modules/ai/infrastructure/services/bot/handlers/ask.handler'
import { helpHandler } from '@/modules/ai/infrastructure/services/bot/handlers/help.handler'
import { linkHandler } from '@/modules/ai/infrastructure/services/bot/handlers/link.handler'
import { unlinkHandler } from '@/modules/ai/infrastructure/services/bot/handlers/unlink.handler'
import {
  HELP_MESSAGE,
  LINK_REQUIRED_MESSAGE,
} from '@/modules/ai/infrastructure/services/bot/messages'
import { env } from '@/shared/env'
import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'

export const bot = new Chat({
  userName: env.APP_NAME,
  adapters: {
    messenger: createMessengerAdapter(),
  },
  state: createPostgresState({ url: env.DATABASE_URL }),
})

const getSubscription = Effect.fn(function* imp(threadId: string) {
  const { db } = yield* DrizzleClient

  const [subscription] = yield* db
    .select({ userId: chatStateSubscriptions.userId })
    .from(chatStateSubscriptions)
    .where(eq(chatStateSubscriptions.threadId, threadId))
    .limit(1)

  return subscription
})

bot.onNewMention(async (thread, message) => {
  await thread.subscribe()
  await thread.post(`Hello, ${message.author.fullName}! \n\n${HELP_MESSAGE}`)
})

bot.onSubscribedMessage(async (thread, message) => {
  const parsed = parseCommand(message.text)

  if (!parsed) return await helpHandler(thread)

  const { command, args } = parsed

  switch (command) {
    case 'help':
      return await helpHandler(thread)

    case 'link':
      return await linkHandler(thread, args)

    case 'unlink':
      return await unlinkHandler(thread)

    case 'ask': {
      if (!args) {
        await thread.post('Usage: /ask {message}')
        return
      }

      await thread.startTyping()

      const subscription = await getSubscription(thread.id).pipe(
        Effect.provide(DrizzleClient.layer),
        Effect.runPromise
      )
      if (!subscription?.userId) {
        await thread.post(LINK_REQUIRED_MESSAGE)
        return
      }

      const ask = createAskHandler(bot, thread.id, subscription.userId)

      const stream = await ask(args, thread.signal)

      await thread.post(stream)
      return
    }

    default:
      await helpHandler(thread)
  }
})
