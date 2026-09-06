import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'
import { UserSchema } from '@/user/schemas/user.schema'

export class UpdateUserDto extends Schema.TaggedClass<UpdateUserDto>()(
  'user/application/UpdateUserDto',
  ApiResponse({
    message: 'Update user successfully',
    dataSchema: Schema.Struct({
      id: UserSchema.fields.id,
      role: UserSchema.fields.role,
    }),
  })
) {}

export namespace UpdateUserDto {
  export const Input = Schema.Struct({
    role: UserSchema.fields.role,
  })
  export type Input = typeof Input.Type

  export const Output = UpdateUserDto.fields.data
  export type Output = typeof Output.Type
}
