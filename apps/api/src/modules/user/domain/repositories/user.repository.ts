import * as Context from 'effect/Context'

import type { User } from '@/modules/user/domain/entities/user.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

// oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
export interface IUserRepository extends IBaseRepository<User> {}

export class UserRepository extends Context.Tag(
  'modules/user/domain/UserRepository'
)<UserRepository, IUserRepository>() {}
