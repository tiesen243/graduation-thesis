import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import { Elysia } from 'elysia'

import { Http } from '@/shared/http'
import { InfrastructureModule } from '@/shared/infrastructure/infratructure.module'

export class Bootstrap {
  public static create(config: Bootstrap.Config) {
    const infrastructureModule = InfrastructureModule.create(
      config.persistenceDriver
    )

    const runtime = ManagedRuntime.make(
      Layer.mergeAll(infrastructureModule.persistenceModule)
    )

    const run = <A>(effect: Effect.Effect<A, Http, never>) =>
      effect.pipe(
        Effect.map((data) => new Http({ data })),
        Effect.catchTag('shared/Http', Effect.succeed),
        Effect.map((http) => http.toResponse()),
        runtime.runPromise
      )

    return new Elysia({
      precompile: true,
    })

      .mapResponse(({ responseValue }) => {
        if (Effect.isEffect(responseValue)) return run(responseValue as never)
        return Response.json(responseValue)
      })
  }
}

// oxlint-disable-next-line typescript/no-namespace
export namespace Bootstrap {
  export interface Config {
    persistenceDriver: 'in-memory' | 'drizzle'
  }
}
