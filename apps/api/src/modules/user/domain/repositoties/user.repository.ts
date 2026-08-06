import * as Context from 'effect/Context'

import type { User } from '@/modules/user/domain/entities/user.entity'
import type { IRepository } from '@/shared/domain/repository'

interface IUserRepository extends IRepository<User> {}

export class UserRepository extends Context.Service<
  UserRepository,
  IUserRepository
>()('user/domain/UserRepository') {}
