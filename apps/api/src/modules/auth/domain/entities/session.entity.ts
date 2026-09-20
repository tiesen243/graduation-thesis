import { Unauthorized } from '@rozumari/contract/auth/schemas/auth.error'
import { SessionSchema } from '@rozumari/contract/auth/schemas/session.schema'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

export class Session extends Schema.TaggedClass<Session>()(
  'auth/domain/Session',
  SessionSchema
) {
  public renew(expiresAt = new Date()): Effect.Effect<Session, Unauthorized> {
    if (expiresAt <= new Date())
      return Effect.fail(
        new Unauthorized({ message: 'Expiration date must be in the future' })
      )

    return Effect.succeed(new Session({ ...structuredClone(this), expiresAt }))
  }
}
