import {
  UserAlreadyDeleted,
  UserUnverified,
} from '@rozumari/contract/user/schemas/user.error'
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
  public isActive(): Effect.Effect<
    boolean,
    UserAlreadyDeleted | UserUnverified
  > {
    if (this.deletedAt !== null)
      return Effect.fail(new UserAlreadyDeleted({ error: { id: this.id } }))

    if (this.emailVerifiedAt === null)
      return Effect.fail(new UserUnverified({ error: { id: this.id } }))

    return Effect.succeed(true)
  }

  public delete(now = new Date()): Effect.Effect<User, UserAlreadyDeleted> {
    if (!this.isActive)
      return Effect.fail(new UserAlreadyDeleted({ error: { id: this.id } }))
    return Effect.succeed(
      new User({ ...structuredClone(this), deletedAt: now, updatedAt: now })
    )
  }

  public update(
    data: Partial<Pick<User, 'username' | 'emailVerifiedAt' | 'role' | 'image'>>
  ): Effect.Effect<User, UserAlreadyDeleted> {
    if (this.deletedAt !== null)
      return Effect.fail(new UserAlreadyDeleted({ error: { id: this.id } }))

    return Effect.succeed(
      new User({
        ...structuredClone(this),
        username: data.username ?? this.username,
        emailVerifiedAt: data.emailVerifiedAt ?? this.emailVerifiedAt,
        role: data.role ?? this.role,
        image: data.image ?? this.image,
        updatedAt: new Date(),
      })
    )
  }
}
