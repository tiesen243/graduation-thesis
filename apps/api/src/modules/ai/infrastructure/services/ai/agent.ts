import type { UserId } from '@rozumari/contract/user/schemas/user.schema'
import type { ChatBinding } from 'chat/ai'

import { ToolLoopAgent } from 'ai'
import { createChatTools } from 'chat/ai'

import { AGENT_INSTRUCTIONS } from '@/modules/ai/infrastructure/services/ai/instructions'
import { openrouter } from '@/modules/ai/infrastructure/services/ai/models'
import { createAgentTools } from '@/modules/ai/infrastructure/services/ai/tools'

export const createAgent = (chat: ChatBinding, scope: string, userId: UserId) =>
  new ToolLoopAgent({
    model: openrouter('openrouter/free'),
    instructions: AGENT_INSTRUCTIONS,
    tools: {
      ...createChatTools({
        preset: 'messenger',
        chat,
        scope,
        strictScope: true,
        requireApproval: true,
      }),
      ...createAgentTools(userId),
    },
  })
