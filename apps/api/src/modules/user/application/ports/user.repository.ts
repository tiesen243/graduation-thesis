import * as Context from 'effect/Context'

import type { User } from '@/modules/user/domain/entities/user.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface IUserRepository extends IBaseRepository<User> {}

export class UserRepository extends Context.Service<
  UserRepository,
  IUserRepository
>()('user/application/UserRepository') {}
