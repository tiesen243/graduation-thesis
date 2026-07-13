import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { Elysia } from 'elysia'

import type { Bootstrap } from '@/bootstrap'

import { UserService } from '@/modules/user/application/user.service'
import { UserInfrastructureModule } from '@/modules/user/infrastructure/infratructure.module'
import { UserController } from '@/modules/user/presentation/user.controller'
import { runEffect } from '@/shared/lib/utils'

export class UserModule {
  public static create(
    driver: Bootstrap.Config['persistenceDriver'],
    // oxlint-disable-next-line typescript/no-explicit-any
    imports: Layer.Layer<any, any, never>
  ) {
    const layer = Layer.provideMerge(
      UserService.live,
      UserInfrastructureModule[driver]
    ).pipe(Layer.provideMerge(imports))
    const runtime = ManagedRuntime.make(layer)

    return {
      exports: {
        userService: UserService.live.pipe(Layer.provide(layer)),
      },

      controller: new Elysia({
        name: 'modules/user',
      })

        .mapResponse(({ responseValue }) =>
          Effect.isEffect(responseValue)
            ? runEffect(runtime, responseValue as never)
            : Response.json(responseValue)
        )

        .use(UserController),
    }
  }
}
