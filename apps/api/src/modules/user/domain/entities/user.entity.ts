import { UserSchema } from '@rozumari/contract/user/schemas/user.schema'
import { createId } from '@rozumari/lib/create-id'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export class User extends Schema.TaggedClass<User>()('user/domain/User', {
  ...UserSchema.fields,
  id: UserSchema.fields.id.pipe(
    Schema.withConstructorDefault(Effect.sync(createId))
  ),
}) {
  public get isActive(): boolean {
    return this.deletedAt === null
  }

  public markDeleted(now = new Date()): User {
    return new User({ ...structuredClone(this), deletedAt: now })
  }

  public update(props: Pick<User, 'role'>): User {
    return new User({ ...structuredClone(this), ...props })
  }
}
