import * as Schema from 'effect/Schema'

export const UserId = Schema.String.pipe(Schema.brand('user/domain/UserId'))
export type UserId = Schema.Schema.Type<typeof UserId>

export class User extends Schema.TaggedClass<User>()('user/domain/User', {
  id: UserId,
  username: Schema.String,
}) {}
