import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type { EntityOverrides } from '@/shared/lib/utils'

import { createClone } from '@/shared/lib/utils'
import { EmailSchema, IdSchema } from '@/shared/schema'

export const UserId = IdSchema.pipe(Schema.brand('user/domain/UserId'))
export type UserId = typeof UserId.Type

export const userRoles = ['user', 'admin'] as const
export const UserRole = Schema.Literals(userRoles).pipe(
  Schema.brand('user/domain/UserRole'),
  Schema.withConstructorDefault(Effect.succeed('user' as const))
)
export type UserRole = typeof UserRole.Type

export class User extends Schema.TaggedClass<User>()('user/domain/User', {
  id: UserId,
  username: Schema.String.check(
    Schema.isPattern(/^[a-z0-9_]+$/u),
    Schema.isMinLength(4),
    Schema.isMaxLength(20)
  ),
  email: EmailSchema,
  image: Schema.NullOr(
    Schema.String.check(
      Schema.isPattern(
        // oxlint-disable-next-line eslint/prefer-named-capture-group
        /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/u
      )
    )
  ).pipe(Schema.withConstructorDefault(Effect.succeed(null))),
  role: UserRole,
  deletedAt: Schema.NullOr(Schema.Date).pipe(
    Schema.withConstructorDefault(Effect.succeed(null))
  ),
  createdAt: Schema.Date.pipe(
    Schema.withConstructorDefault(Effect.sync(() => new Date()))
  ),
  updatedAt: Schema.Date.pipe(
    Schema.withConstructorDefault(Effect.sync(() => new Date()))
  ),
}) {
  public clone(overrides?: EntityOverrides<this>): this {
    return createClone(this, overrides)
  }

  public toJSON(): Omit<this, 'clone' | 'toJSON' | '_tag'> {
    return structuredClone(this)
  }
}
