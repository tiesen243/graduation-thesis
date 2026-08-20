import * as Layer from 'effect/Layer'

import type { AppModule } from '@/modules/app.module'

import { DeleteUserUseCase } from '@/modules/user/application/use-case/delete-user.use-case'
import { ListUsersUseCase } from '@/modules/user/application/use-case/list-users.use-case'
import { ShowUserUseCase } from '@/modules/user/application/use-case/show-user.use-case'
import { UpdateUserUseCase } from '@/modules/user/application/use-case/update-user.use-case'
import { UserService } from '@/modules/user/application/user.service'
import { UserInfrastructureModule } from '@/modules/user/infrastructure/infrastructure.module'
import { userCommand } from '@/modules/user/presentation/cli/user.command'
import { userController } from '@/modules/user/presentation/http/user.controller'

export class UserModule {
  public static create(config: Pick<AppModule.Config, 'persistence'>) {
    const infrastructureLayer = UserInfrastructureModule.create(
      config.persistence
    )

    const useCaseLayer = Layer.mergeAll(
      ListUsersUseCase.layer,
      ShowUserUseCase.layer,
      DeleteUserUseCase.layer,
      UpdateUserUseCase.layer
    )

    const serviceLayer = Layer.mergeAll(UserService.layer)

    const applicationLayer = Layer.provideMerge(useCaseLayer, serviceLayer)

    const layer = Layer.provideMerge(applicationLayer, infrastructureLayer)

    return {
      controller: userController.pipe(Layer.provide(layer)),

      command: userCommand,

      exports: {
        layer,

        services: {
          userService: UserService.layer.pipe(Layer.provide(layer)),
        },
      },
    }
  }
}
