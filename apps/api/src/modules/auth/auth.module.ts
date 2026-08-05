import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { UserService } from '@/modules/user/application/user.service'

import { AuthService } from '@/modules/auth/application/auth.service'
import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-case/register.use-case'
import { WhoAmIUseCase } from '@/modules/auth/application/use-case/whoami.use-case'
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/infrastructure.module'
import { authController } from '@/modules/auth/presentation/http/auth.controller'
import { adminMiddleware } from '@/modules/auth/presentation/middleware/admin.middlware'
import { authMiddleware } from '@/modules/auth/presentation/middleware/auth.middleware'

export class AuthModule {
  public static create(
    config: Pick<AppModule.Config, 'persistence' | 'auth'>,
    imports: { userService: Layer.Layer<UserService, unknown> }
  ) {
    const infrastructureLayer = AuthInfrastructureModule.create(
      config.persistence,
      config.auth
    )

    const useCaseLayer = Layer.mergeAll(
      LoginUseCase.layer,
      RegisterUseCase.layer,
      WhoAmIUseCase.layer
    )

    const serviceLayer = Layer.provideMerge(
      AuthService.layer,
      imports.userService
    )

    const applicationLayer = Layer.provideMerge(useCaseLayer, serviceLayer)

    const layer = Layer.provideMerge(applicationLayer, infrastructureLayer)

    return {
      controller: authController.pipe(Layer.provide(layer)),

      exports: {
        layer,

        middlewares: {
          auth: authMiddleware.pipe(Layer.provide(layer)),
          admin: adminMiddleware.pipe(Layer.provide(layer)),
        },

        services: {
          authService: AuthService.layer,
        },
      },
    }
  }
}
