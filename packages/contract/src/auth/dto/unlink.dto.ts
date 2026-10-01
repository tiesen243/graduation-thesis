import * as Schema from 'effect/Schema'

import { AccountProvider } from '@/auth/schemas/account.schema'
import { ApiResponse } from '@/schema'

export class UnlinkDto extends Schema.TaggedClass<UnlinkDto>()(
  'auth/application/UnlinkDto',
  ApiResponse({
    message: 'Unlink account successfully',
  })
) {}

export namespace UnlinkDto {
  export const Input = Schema.Struct({
    provider: AccountProvider,
  })
  export type Input = typeof Input.Type

  export const Output = UnlinkDto.fields.data
  export type Output = typeof Output.Type
}
