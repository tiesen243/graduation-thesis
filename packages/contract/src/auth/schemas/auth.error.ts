import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class Unauthorized extends Schema.TaggedError<Unauthorized>()(
  'auth/domain/Unauthorized',
  ApiResponse({
    status: 401,
    message: 'Unauthorized',
  }).annotate({ httpApiStatus: 401 }),
  { httpApiStatus: 401 }
) {}

export class Forbidden extends Schema.TaggedError<Forbidden>()(
  'auth/domain/Forbidden',
  ApiResponse({
    status: 403,
    message: 'You do not have permission to access this resource',
  }),
  { httpApiStatus: 403 }
) {}

export class InvalidCredentials extends Schema.TaggedError<InvalidCredentials>()(
  'auth/domain/InvalidCredentials',
  ApiResponse({
    status: 401,
    message: 'Invalid credentials',
  }),
  { httpApiStatus: 401 }
) {}

export class ProviderError extends Schema.TaggedError<ProviderError>()(
  'auth/domain/ProviderError',
  ApiResponse({ status: 400 }),
  { httpApiStatus: 400 }
) {}

export class AuthError extends Schema.TaggedError<AuthError>()(
  'auth/domain/AuthError',
  {
    reason: Schema.Union([
      Unauthorized,
      Forbidden,
      InvalidCredentials,
      ProviderError,
    ]),
  }
) {}
