import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { Api } from '@/api'
import { HealthUseCase } from '@/modules/home/application/use-case/health.use-case'
import {
  HealthSuccess,
  HomeSuccess,
} from '@/modules/home/presentation/api/home.group'

export const HomeHandler = HttpApiBuilder.group(Api, 'home', (handlers) =>
  handlers
    .handle('index', () =>
      Effect.succeed(HomeSuccess.make({ message: 'Welcome to the API' }))
    )

    .handle('health', () =>
      HealthUseCase.use((s) => s.execute()).pipe(
        Effect.map((data) => HealthSuccess.make({ data }))
      )
    )
)
