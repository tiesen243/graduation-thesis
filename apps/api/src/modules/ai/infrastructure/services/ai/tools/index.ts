import type { UserId } from '@rozumari/contract/user/schemas/user.schema'

import { createDeviceTools } from '@/modules/ai/infrastructure/services/ai/tools/device.tool'
import { createScheduleTools } from '@/modules/ai/infrastructure/services/ai/tools/schedule.tool'
import { createUserTools } from '@/modules/ai/infrastructure/services/ai/tools/user.tool'
import { createUtilsTools } from '@/modules/ai/infrastructure/services/ai/tools/utils.tool'

export const createAgentTools = (userId: UserId) => ({
  ...createUserTools(userId),
  ...createDeviceTools(userId),
  ...createScheduleTools(userId),
  ...createUtilsTools(),
})
