import * as Layer from 'effect/Layer'

import { DrizzleAccountRepository } from '@/modules/auth/infrastructure/persistence/drizzle/repositories/account.repository'
import { DrizzleSessionRepository } from '@/modules/auth/infrastructure/persistence/drizzle/repositories/session.repository'

export const AuthInfrastructureDrizzleModule = Layer.mergeAll(
  DrizzleAccountRepository,
  DrizzleSessionRepository
)
