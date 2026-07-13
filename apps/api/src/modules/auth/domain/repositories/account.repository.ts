import * as Context from 'effect/Context'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { IBaseRepository } from '@/shared/domain/base.repository'

// oxlint-disable-next-line typescript/no-empty-interface typescript/no-empty-object-type
export interface IAccountRepository extends IBaseRepository<Account> {}

export class AccountRepository extends Context.Tag(
  'modules/user/domain/AccountRepository'
)<AccountRepository, IAccountRepository>() {}
