import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { Elysia } from 'elysia'

import type { Bootstrap } from '@/bootstrap'

import { AuthService } from '@/modules/auth/application/auth.service'
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/infratructure.module'
import { AuthController } from '@/modules/auth/presentation/auth.controller'
import { runEffect } from '@/shared/lib/utils'

export class AuthModule {
  public static create(
    driver: Bootstrap.Config['persistenceDriver'],
    // oxlint-disable-next-line typescript/no-explicit-any
    imports: (that: Layer.Layer<any, any, any>) => Layer.Layer<any, any, never>
  ) {
    const layer = Layer.provideMerge(
      AuthService.live,
      AuthInfrastructureModule[driver] as never
    ).pipe(imports)
    const runtime = ManagedRuntime.make(layer)

    return {
      exports: {
        authService: AuthService.live.pipe(Layer.provide(layer)),
      },

      controller: new Elysia({
        name: 'modules/auth',
      })

        .mapResponse(({ responseValue }) =>
          Effect.isEffect(responseValue)
            ? runEffect(runtime, responseValue as never)
            : Response.json(responseValue)
        )

        .use(AuthController),
    }
  }
}
