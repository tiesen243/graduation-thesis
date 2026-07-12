import * as Layer from 'effect/Layer'

import { InMemoryUserRepository } from '@/modules/user/infrastructure/persistence/in-memory/repositories/user.repository'

export const UserInfrastructureInMemoryModule = Layer.mergeAll(
  InMemoryUserRepository
)
