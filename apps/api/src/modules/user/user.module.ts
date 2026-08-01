import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case.ts'
import { OneUserUseCase } from '@/modules/user/application/use-case/one-user.use-case'
import { UserService } from '@/modules/user/application/user.service'
import { UserInfrastructureModule } from '@/modules/user/infrastructure/infrastructure.module'
import { UserHandler } from '@/modules/user/presentation/http/user.handler'

export class UserModule {
  public static create(config: Pick<AppModule.Config, 'persistentDriver'>) {
    const infrastructureLayer = UserInfrastructureModule.create(
      config.persistentDriver
    )

    const useCaseLayer = Layer.mergeAll(
      ListUsersUseCase.layer,
      OneUserUseCase.layer,
      UserService.layer
    )

    const layer = Layer.provideMerge(useCaseLayer, infrastructureLayer)

    return {
      layer: UserHandler.pipe(Layer.provide(layer)),

      exports: {
        userService: UserService.layer.pipe(Layer.provide(layer)),
      },
    }
  }
}
