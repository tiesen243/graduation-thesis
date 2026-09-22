import { UserAlreadyDeleted } from '@rozumari/contract/user/schemas/user.error'
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

  public delete(now = new Date()): Effect.Effect<User, UserAlreadyDeleted> {
    if (!this.isActive)
      return Effect.fail(new UserAlreadyDeleted({ error: { id: this.id } }))
    return Effect.succeed(
      new User({ ...structuredClone(this), deletedAt: now, updatedAt: now })
    )
  }

  public changeRole(
    role: User['role']
  ): Effect.Effect<User, UserAlreadyDeleted> {
    if (!this.isActive)
      return Effect.fail(new UserAlreadyDeleted({ error: { id: this.id } }))
    return Effect.succeed(
      new User({ ...structuredClone(this), role, updatedAt: new Date() })
    )
  }
}
