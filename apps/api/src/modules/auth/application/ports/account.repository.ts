import * as Context from 'effect/Context'

import type { Account } from '@/modules/auth/domain/entities/account.entity'
import type { IBaseRepository } from '@/shared/application/repositories/base.repository'

interface IAccountRepository extends IBaseRepository<Account> {}

export class AccountRepository extends Context.Service<
  AccountRepository,
  IAccountRepository
>()('auth/domain/AccountRepository') {}
