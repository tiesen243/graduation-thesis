import { AccountSchema } from '@rozumari/contract/auth/schemas/account.schema'
import * as Schema from 'effect/Schema'

export class Account extends Schema.TaggedClass<Account>()(
  'auth/domain/Account',
  AccountSchema
) {
  public updatePassword(password: string) {
    return new Account({ ...structuredClone(this), password })
  }
}
