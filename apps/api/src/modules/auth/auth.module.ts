import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { UserService } from '@/modules/user/application/ports/user.service'

import { ChangePasswordUseCase } from '@/modules/auth/application/use-case/change-password.use-case'
import { ForgotPasswordUseCase } from '@/modules/auth/application/use-case/forgot-password.use-case'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { LogoutUseCase } from '@/modules/auth/application/use-case/logout.use-case'
import { OAuthUseCase } from '@/modules/auth/application/use-case/oauth.use-case'
import { RefreshTokenUseCase } from '@/modules/auth/application/use-case/refresh-token.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { ResetPasswordUseCase } from '@/modules/auth/application/use-case/reset-password'
import { WhoAmIUseCase } from '@/modules/auth/application/use-case/whoami.use-case'
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/infrastructure.module'
import { authController } from '@/modules/auth/presentation/http/auth.controller'
import { oauthController } from '@/modules/auth/presentation/http/oauth.controller'
import { adminMiddleware } from '@/modules/auth/presentation/middleware/admin.middlware'
import { authMiddleware } from '@/modules/auth/presentation/middleware/auth.middleware'

export class AuthModule {
  public static create(
    config: Pick<AppModule.Config, 'persistence' | 'providers'>,
    imports: Layer.Layer<UserService>
  ) {
    const infrastructureLayer = AuthInfrastructureModule.create(
      config.persistence,
      config.providers
    ).pipe(Layer.merge(imports))

    const useCaseLayer = Layer.mergeAll(
      ChangePasswordUseCase.layer,
      ForgotPasswordUseCase.layer,
      LoginUseCase.layer,
      LogoutUseCase.layer,
      OAuthUseCase.layer,
      RefreshTokenUseCase.layer,
      RegisterUseCase.layer,
      ResetPasswordUseCase.layer,
      WhoAmIUseCase.layer
    )

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      controller: Layer.mergeAll(authController, oauthController).pipe(
        Layer.provide(layer)
      ),

      exports: {
        middleware: Layer.merge(authMiddleware, adminMiddleware).pipe(
          Layer.provide(layer)
        ),
      },
    }
  }
}
