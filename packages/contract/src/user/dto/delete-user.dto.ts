import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'
import { UserSchema } from '@/user/schemas/user.schema'

export class DeleteUserDto extends Schema.TaggedClass<DeleteUserDto>()(
  'user/application/DeleteUserDto',
  ApiResponse({
    message: 'User deleted successfully',
    dataSchema: Schema.Struct({
      id: UserSchema.fields.id,
      deletedAt: UserSchema.fields.deletedAt,
    }),
  })
) {}

export namespace DeleteUserDto {
  export const Input = Schema.Struct({
    id: UserSchema.fields.id,
  })
  export type Input = typeof Input.Type

  export const Output = DeleteUserDto.fields.data
  export type Output = typeof Output.Type
}
