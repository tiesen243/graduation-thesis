import { UserSchema } from '@rozumari/contract/user/schemas/user.schema'
import * as Schema from 'effect/Schema'

export class User extends Schema.TaggedClass<User>()(
  'user/domain/User',
  UserSchema
) {
  public get isActive(): boolean {
    return this.deletedAt === null
  }

  public markDeleted(now = new Date()): User {
    return new User({
      ...structuredClone(this),
      deletedAt: now,
    })
  }
}
