import * as Layer from 'effect/Layer'
import * as FetchHttpClient from 'effect/unstable/http/FetchHttpClient'

import type { AppModule } from '@/modules/app.module'

import { DrizzleClient } from '@/shared/infrastructure/persistence/drizzle/drizzle.client'
import { InMemoryClient } from '@/shared/infrastructure/persistence/in-memory/in-menory.client'
import { jwtLayer } from '@/shared/infrastructure/services/jwt.layer'
import { resendLayer } from '@/shared/infrastructure/services/resend.service'
import { streamLayer } from '@/shared/infrastructure/services/stream.layer'

export class InfrastructureModule {
  public static create(driver: AppModule.Config['persistence']) {
    const persistenceLayer =
      driver === 'in-memory' ? InMemoryClient.layer : DrizzleClient.layer

    const infrasLayer = Layer.mergeAll(
      persistenceLayer,
      jwtLayer('HS256'),
      resendLayer,
      streamLayer
    )

    return Layer.provideMerge(infrasLayer, FetchHttpClient.layer)
  }
}
