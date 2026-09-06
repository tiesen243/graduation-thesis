import * as Schema from 'effect/Schema'

import { ApiResponse, Email, Password, Username } from '@/schema'

export class RegisterDto extends Schema.TaggedClass<RegisterDto>()(
  'auth/application/RegisterDto',
  ApiResponse({
    message: 'Register successfully',
  })
) {}

export namespace RegisterDto {
  export const Input = Schema.Struct({
    username: Username,
    email: Email,
    password: Password,
  })
  export type Input = typeof Input.Type

  export const Output = RegisterDto.fields.data
  export type Output = typeof Output.Type
}
