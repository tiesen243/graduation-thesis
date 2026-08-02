import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { UserService } from '@/modules/user/application/user.service'

import { AuthService } from '@/modules/auth/application/auth.service'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/infrastructure.module'
import { AuthHandler } from '@/modules/auth/presentation/http/auth.handler'
import { AuthMiddlewareHandler } from '@/modules/auth/presentation/http/auth.middlware'
import { OAuthHandler } from '@/modules/auth/presentation/http/oauth.handler'

export class AuthModule {
  public static create(
    config: Pick<AppModule.Config, 'persistentDriver' | 'auth'>,
    imports: {
      userService: Layer.Layer<UserService, unknown>
    }
  ) {
    const infrastructureLayer = AuthInfrastructureModule.create(
      config.persistentDriver,
      config.auth
    )

    const useCaseLayer = Layer.mergeAll(
      LoginUseCase.layer,
      RegisterUseCase.layer
    )

    const applicationLayer = Layer.provideMerge(useCaseLayer, AuthService.layer)

    const layer = Layer.provideMerge(
      applicationLayer,
      Layer.mergeAll(infrastructureLayer, imports.userService)
    )

    const handler = Layer.merge(AuthHandler, OAuthHandler)

    return {
      layer: Layer.provide(handler, layer),

      middleware: AuthMiddlewareHandler.pipe(Layer.provide(layer)),
    }
  }
}
