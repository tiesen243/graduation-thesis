import * as Layer from 'effect/Layer'

import { InMemoryAccountRepository } from '@/modules/auth/infrastructure/persistence/in-memory/repositories/account.repository'
import { InMemorySessionRepository } from '@/modules/auth/infrastructure/persistence/in-memory/repositories/session.repository'

export const AuthInfrastructureInMemoryModule = Layer.mergeAll(
  InMemoryAccountRepository,
  InMemorySessionRepository
)
