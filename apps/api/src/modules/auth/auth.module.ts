import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { Elysia } from 'elysia'

import type { Bootstrap } from '@/bootstrap'
import type { UserService } from '@/modules/user/application/user.service'

import { AuthService } from '@/modules/auth/application/auth.service'
import { OAuthService } from '@/modules/auth/application/oauth.service'
import { AuthInfrastructureModule } from '@/modules/auth/infrastructure/infratructure.module'
import { OAuthInfrastructureModule } from '@/modules/auth/infrastructure/oauth/oauth.module'
import { AuthController } from '@/modules/auth/presentation/auth.controller'
import { OAuthController } from '@/modules/auth/presentation/oauth.controller'
import { runEffect } from '@/shared/lib/utils'

export class AuthModule {
  public static create(
    driver: Bootstrap.Config['persistenceDriver'],
    providers: Bootstrap.Config['providers'],
    inports: Layer.Layer<UserService>
  ) {
    const authInfrastructureModule = AuthInfrastructureModule.create(driver)
    const oauthInfrastructureModule =
      OAuthInfrastructureModule.create(providers)

    const layer = Layer.merge(AuthService.live, OAuthService.live).pipe(
      Layer.provideMerge(authInfrastructureModule.persistenceModule),
      Layer.provideMerge(oauthInfrastructureModule),
      Layer.provideMerge(inports)
    )
    const runtime = ManagedRuntime.make(layer)

    return {
      exports: {
        authService: AuthService.live.pipe(Layer.provide(layer)),
        oauthService: OAuthService.live.pipe(Layer.provide(layer)),
      },

      controller: new Elysia({
        name: 'modules/auth',
      })

        .mapResponse(({ responseValue }) =>
          Effect.isEffect(responseValue)
            ? runEffect(runtime, responseValue as never)
            : Response.json(responseValue)
        )

        .use(AuthController)
        .use(OAuthController),
    }
  }
}
