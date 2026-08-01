import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'
import type { UserService } from '@/modules/user/application/user.service'

import { LoginUseCase } from '@/modules/auth/application/use-case/login.use-case'
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/infrastructure.module'
import { AuthHandler } from '@/modules/auth/presentation/http/auth.handler'
import { AuthMiddleware } from '@/modules/auth/presentation/http/auth.middleware'

export class AuthModule {
  public static create(
    config: Pick<AppModule.Config, 'persistentDriver'>,
    imports: {
      userService: Layer.Layer<UserService, unknown>
    }
  ) {
    const infrastructureLayer = AuthInfrastructureModule.create(
      config.persistentDriver
    )

    const useCaseLayer = Layer.mergeAll(LoginUseCase.layer)

    const layer = Layer.provideMerge(
      useCaseLayer,
      Layer.merge(infrastructureLayer, imports.userService)
    )

    return {
      layer: AuthHandler.pipe(Layer.provide(layer)),

      middleware: AuthMiddleware.layer.pipe(Layer.provide(imports.userService)),
    }
  }
}
