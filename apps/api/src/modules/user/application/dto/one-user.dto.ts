import * as Schema from 'effect/Schema'

import { User, UserId } from '@/modules/user/domain/entities/user.entity'

export namespace OneUserDto {
  export const Input = Schema.Struct({ id: UserId })
  export type Input = typeof Input.Type

  export const Output = Schema.Struct({
    id: UserId,
    username: User.fields.username,
    email: User.fields.email,
    role: User.fields.role,
  })
  export type Output = typeof Output.Type
}
