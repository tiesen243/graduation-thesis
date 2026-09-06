import * as Schema from 'effect/Schema'

import { ApiResponse, Email } from '@/schema'

export class ForgotPasswordDto extends Schema.TaggedClass<ForgotPasswordDto>()(
  'auth/application/ForgotPasswordDto',
  ApiResponse({
    message: 'Reset password email sent successfully',
  })
) {}

export namespace ForgotPasswordDto {
  export const Input = Schema.Struct({
    email: Email,
  })
  export type Input = typeof Input.Type

  export const Output = ForgotPasswordDto.fields.data
  export type Output = typeof Output.Type
}
