import * as Schema from 'effect/Schema'

import { ApiResponse, Password } from '@/schema'

export class ResetPasswordDto extends Schema.TaggedClass<ResetPasswordDto>()(
  'auth/application/ResetPasswordDto',
  ApiResponse({
    message: 'Password reset successfully',
  })
) {}

export namespace ResetPasswordDto {
  export const Headers = Schema.Struct({
    Authorization: Schema.optionalKey(Schema.String),
  })

  export const Input = Schema.Struct({
    password: Password,
  })
  export type Input = typeof Input.Type

  export const Output = ResetPasswordDto.fields.data
  export type Output = typeof Output.Type
}
