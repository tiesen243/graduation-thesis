import { SessionSchema } from '@rozumari/contract/auth/schemas/session.schema'
import * as Schema from 'effect/Schema'

export class Session extends Schema.TaggedClass<Session>()(
  'auth/domain/Session',
  SessionSchema
) {
  public renew(expiresAt = new Date()) {
    if (expiresAt <= new Date())
      throw new Error('Expiration date must be in the future')

    return new Session({
      ...structuredClone(this),
      expiresAt,
    })
  }
}
