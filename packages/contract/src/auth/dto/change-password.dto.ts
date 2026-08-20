import * as Schema from 'effect/Schema'

import { ApiResponse, Password } from '@/schema'

export class ChangePasswordDto extends Schema.TaggedClass<ChangePasswordDto>()(
  'auth/application/ChangePasswordDto',
  ApiResponse({
    message: 'Password changed successfully',
  })
) {}

export namespace ChangePasswordDto {
  export const Input = Schema.Struct({
    currentPassword: Schema.optionalKey(Password),
    newPassword: Password,
  })
  export type Input = typeof Input.Type

  export const Output = ChangePasswordDto.fields.data
  export type Output = typeof Output.Type
}
