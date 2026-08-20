import * as Schema from 'effect/Schema'

import { ApiResponse, Pagination } from '@/schema'
import { UserSchema } from '@/user/schemas/user.schema'

export class ListUsersDto extends Schema.TaggedClass<ListUsersDto>()(
  'user/application/ListUsersDto',
  ApiResponse({
    message: 'Get list of users successfully',
    dataSchema: Schema.Struct({
      users: Schema.Array(
        Schema.Struct({
          id: UserSchema.fields.id,
          username: UserSchema.fields.username,
          email: UserSchema.fields.email,
          role: UserSchema.fields.role,
          image: UserSchema.fields.image,
          createdAt: UserSchema.fields.createdAt,
          updatedAt: UserSchema.fields.updatedAt,
          deletedAt: UserSchema.fields.deletedAt,
        })
      ),
      meta: Pagination.Output,
    }),
  })
) {}

export namespace ListUsersDto {
  export const Input = Pagination.Input.pipe(
    Schema.fieldsAssign({
      query: Schema.optional(Schema.String),
    })
  )
  export type Input = typeof Input.Type

  export const Output = ListUsersDto.fields.data
  export type Output = typeof Output.Type
}
