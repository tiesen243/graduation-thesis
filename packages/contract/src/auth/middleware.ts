// oxlint-disable eslint/max-classes-per-file

import * as Context from 'effect/Context'
import * as HttpApiMiddleware from 'effect/unstable/httpapi/HttpApiMiddleware'
import * as HttpApiSecurity from 'effect/unstable/httpapi/HttpApiSecurity'

import type { UserId, UserRole } from '@/user/schemas/user.schema'

import { Forbidden, Unauthorized } from '@/auth/schemas/auth.error'

export interface JwtPayload {
  userId: UserId
  userRole: UserRole
}

export const COOKIE_ACCESS_TOKEN_KEY = 'auth.access_token'

export class CurrentUser extends Context.Service<CurrentUser, JwtPayload>()(
  'auth/middleware/CurrentUser'
) {}

export class AuthMiddleware extends HttpApiMiddleware.Service<
  AuthMiddleware,
  {
    // Middleware can provide services to other middleware and endpoints, which is
    // useful for things like authentication, where you want to inject the current
    // user into the context for other endpoints to consume.
    provides: CurrentUser

    // If your middleware requires dependencies from other middleware, you can
    // specify those as well.
    requires: never
  }
>()('auth/middleware/AuthMiddleware', {
  // This middleware requires clients to also provide an implementation, to
  // inject a api key
  requiredForClient: true,

  // Middleware can optionally define security schemes, which are used to
  // generate OpenAPI docs and decode credientials from incoming requests for
  // you.
  security: {
    bearer: HttpApiSecurity.bearer,
    token: HttpApiSecurity.apiKey({
      key: COOKIE_ACCESS_TOKEN_KEY,
      in: 'cookie',
    }),
  },

  // Middlware can specify errors that it may raise
  error: Unauthorized,
}) {}

export class AdminMiddleware extends HttpApiMiddleware.Service<
  AdminMiddleware,
  { provides: never; requires: CurrentUser }
>()('auth/middleware/AdminMiddleware', {
  error: [Forbidden],
}) {}
