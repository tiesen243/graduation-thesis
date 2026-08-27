import type { ForgotPasswordDto } from '@rozumari/contract/auth/dto/forgot-password.dto'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import { UserService } from '@/modules/user/application/user.service'
import { env } from '@/shared/env'
import { Jwt } from '@/shared/infrastructure/jwt'
import { ResendService } from '@/shared/infrastructure/third-party/resend/resend.service'

export class ForgotPasswordUseCase extends Context.Service<
  ForgotPasswordUseCase,
  {
    readonly execute: (
      input: ForgotPasswordDto.Input
    ) => Effect.Effect<ForgotPasswordDto.Output>
  }
>()('auth/application/ForgotPasswordUseCase', {
  make: Effect.gen(function* make() {
    const userService = yield* UserService
    const jwt = yield* Jwt

    const resend = yield* Effect.option(ResendService)

    return {
      execute: Effect.fn(function* execute(input) {
        if (resend._tag === 'None') return null

        const user = yield* userService.findByIdentifier({
          email: input.email,
        })
        if (!user) return null

        const token = yield* jwt.sign(
          { userId: user.id, userRole: user.role },
          { expiresIn: 5 * 60 /* 5 minutes */ }
        )
        yield* resend.value.sendEmail({
          to: [user.email],
          subject: 'Reset your password',
          html: /* HTML */ `
            <p>Click the link below to reset your password:</p>
            <a href="${env.CORS_ORIGIN[0]}/forgot-password/reset?token=${token}"
              >Reset Password</a
            >
          `,
        })

        return null
      }),
    }
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
