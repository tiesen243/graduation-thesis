import * as Schema from 'effect/Schema'

import { Token } from '@/auth/schemas/token.schema'
import { ApiResponse, Email, Password } from '@/schema'

export class LoginDto extends Schema.TaggedClass<LoginDto>()(
  'auth/application/LoginDto',
  ApiResponse({
    message: 'Login successfully',
    dataSchema: Token,
  })
) {}

export namespace LoginDto {
  export const Input = Schema.Struct({
    email: Email,
    password: Password,
  })
  export type Input = typeof Input.Type

  export const Output = LoginDto.fields.data
  export type Output = typeof Output.Type
}
