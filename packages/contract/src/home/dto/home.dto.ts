import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class HomeDto extends Schema.TaggedClass<HomeDto>()(
  'home/application/HomeDto',
  ApiResponse({
    message: 'Welcome to the API',
  })
) {}

export namespace HomeDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = HomeDto.fields.data
  export type Output = typeof Output.Type
}
