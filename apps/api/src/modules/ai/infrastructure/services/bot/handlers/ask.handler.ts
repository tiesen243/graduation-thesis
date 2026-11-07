import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { ChatBinding } from 'chat/ai'

import { createAgent } from '@/modules/ai/infrastructure/services/ai/agent'

export const createAskHandler =
  (chat: ChatBinding, threadId: string, userId: UserId) =>
  async (prompt: string, signal: AbortSignal) => {
    const agent = createAgent(chat, threadId, userId)

    const result = await agent.stream({
      prompt,
      abortSignal: signal,
    })

    return result.stream
  }
