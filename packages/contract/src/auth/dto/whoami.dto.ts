import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'
import { UserSchema } from '@/user/schemas/user.schema'

export class WhoAmIDto extends Schema.TaggedClass<WhoAmIDto>()(
  'auth/application/WhoAmIDto',
  ApiResponse({
    message: 'Get current user successfully',
    dataSchema: UserSchema,
  })
) {}

export namespace WhoAmIDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = WhoAmIDto.fields.data
  export type Output = typeof Output.Type
}
