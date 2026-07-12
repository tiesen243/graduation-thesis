import * as Layer from 'effect/Layer'

import { DrizzleUserRepository } from '@/modules/user/infrastructure/persistence/drizzle/repositories/user.repository'

export const UserInfrastructureDrizzleModule = Layer.mergeAll(
  DrizzleUserRepository
)
