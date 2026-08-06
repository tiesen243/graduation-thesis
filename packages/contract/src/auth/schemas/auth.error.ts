import * as Schema from 'effect/Schema'

import { ApiResponse } from '@/schema'

export class Unauthorized extends Schema.TaggedErrorClass<Unauthorized>()(
  'auth/domain/Unauthorized',
  ApiResponse({
    status: 401,
    message: 'Unauthorized',
  }).annotate({ httpApiStatus: 401 }),
  { httpApiStatus: 401 }
) {}

export class Forbidden extends Schema.TaggedErrorClass<Forbidden>()(
  'auth/domain/Forbidden',
  ApiResponse({
    status: 403,
    message: 'You do not have permission to access this resource',
  }),
  { httpApiStatus: 403 }
) {}

export class InvalidCredentials extends Schema.TaggedErrorClass<InvalidCredentials>()(
  'auth/domain/InvalidCredentials',
  ApiResponse({
    status: 401,
    message: 'Invalid credentials',
  }),
  { httpApiStatus: 401 }
) {}

export class InvalidToken extends Schema.TaggedErrorClass<InvalidToken>()(
  'auth/domain/InvalidToken',
  ApiResponse({
    status: 401,
    message: 'Invalid token',
  }),
  { httpApiStatus: 401 }
) {}

export class TokenExpired extends Schema.TaggedErrorClass<TokenExpired>()(
  'auth/domain/TokenExpired',
  ApiResponse({
    status: 401,
    message: 'Token expired',
  }),
  { httpApiStatus: 401 }
) {}

export class ProviderError extends Schema.TaggedErrorClass<ProviderError>()(
  'auth/domain/ProviderError',
  ApiResponse({ status: 400 }),
  { httpApiStatus: 400 }
) {}

export class AuthError extends Schema.TaggedErrorClass<AuthError>()(
  'auth/domain/AuthError',
  {
    reason: Schema.Union([
      Unauthorized,
      Forbidden,
      InvalidCredentials,
      InvalidToken,
      TokenExpired,
      ProviderError,
    ]),
  }
) {}
