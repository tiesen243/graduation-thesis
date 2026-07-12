import * as Effect from 'effect/Effect'

import { LoginDto } from '@/modules/auth/application/dto/login.dto'

export const loginUseCase = (
  _input: LoginDto.Input
): Effect.Effect<LoginDto.Output> =>
  // oxlint-disable-next-line require-yield
  Effect.gen(function* loginUseCaseGen() {
    return LoginDto.output.parse({
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      expiresAt: new Date(),
    })
  })
