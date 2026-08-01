import * as Schema from 'effect/Schema'

import { User } from '@/modules/user/domain/entities/user.entity'
import { PaginationSchema } from '@/shared/schema'

export namespace ListUsersDto {
  export const Input = PaginationSchema.Input.pipe(
    Schema.fieldsAssign({
      query: Schema.optional(Schema.String),
    })
  )
  export type Input = typeof Input.Type

  export const Output = Schema.Struct({
    users: Schema.Array(
      Schema.Struct({
        id: User.fields.id,
        username: User.fields.username,
        image: User.fields.image,
      })
    ),
    meta: PaginationSchema.Output,
  })
  export type Output = typeof Output.Type
}
