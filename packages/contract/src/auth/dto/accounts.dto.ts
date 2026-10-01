import * as Schema from 'effect/Schema'

import { AccountSchema } from '@/auth/schemas/account.schema'
import { ApiResponse } from '@/schema'

export class AccountsDto extends Schema.TaggedClass<AccountsDto>()(
  'auth/application/AccountsDto',
  ApiResponse({
    message: 'Get all accounts successfully',
    dataSchema: Schema.Array(AccountSchema),
  })
) {}

export namespace AccountsDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = AccountsDto.fields.data
  export type Output = typeof Output.Type
}
