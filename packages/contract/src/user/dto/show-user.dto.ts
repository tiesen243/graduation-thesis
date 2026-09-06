import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'
import { UserSchema } from '@/user/schemas/user.schema'

export class ShowUserDto extends Schema.TaggedClass<ShowUserDto>()(
  'user/application/ShowUserDto',
  ApiResponse({
    message: 'Get user successfully',
    dataSchema: UserSchema,
  })
) {}

export namespace ShowUserDto {
  export const Input = Schema.Struct({
    id: UserSchema.fields.id,
  })
  export type Input = typeof Input.Type

  export const Output = ShowUserDto.fields.data
  export type Output = typeof Output.Type
}
