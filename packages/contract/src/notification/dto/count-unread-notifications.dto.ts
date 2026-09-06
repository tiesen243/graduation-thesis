import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class CountUnreadNotificationsDto extends Schema.TaggedClass<CountUnreadNotificationsDto>()(
  'notification/application/CountUnreadNotificationsDto',
  ApiResponse({
    message: 'Create notification successfully',
    dataSchema: Schema.Struct({
      count: Schema.Number,
    }),
  })
) {}

export namespace CountUnreadNotificationsDto {
  export const Input = Schema.Void
  export type Input = typeof Input.Type

  export const Output = CountUnreadNotificationsDto.fields.data
  export type Output = typeof Output.Type
}
