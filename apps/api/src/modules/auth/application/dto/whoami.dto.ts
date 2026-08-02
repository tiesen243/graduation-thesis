import * as Schema from 'effect/Schema'

import { User } from '@/modules/user/domain/entities/user.entity'

export namespace WhoamiDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = Schema.Struct({
    id: User.fields.id,
    username: User.fields.username,
    email: User.fields.email,
    image: User.fields.image,
    role: User.fields.role,
  })
  export type Output = typeof Output.Type
}
