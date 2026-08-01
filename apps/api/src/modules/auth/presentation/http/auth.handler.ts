import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import {
  LoginSuccess,
  WhoamiSuccess,
} from '@/modules/auth/presentation/http/auth.group'
import { CurrentUser } from '@/modules/auth/presentation/http/auth.middleware'

export const AuthHandler = HttpApiBuilder.group(Api, 'auth', (handlers) =>
  handlers
    .handle('login', ({ payload }) =>
      LoginUseCase.use((s) => s.execute(payload)).pipe(
        Effect.map((data) => LoginSuccess.make({ data }))
      )
    )

    .handle('whoami', () =>
      CurrentUser.pipe(Effect.map((data) => WhoamiSuccess.make({ data })))
    )
)
