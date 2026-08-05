import { Api } from '@rozumari/contract'
import { HealthDto } from '@rozumari/contract/home/dto/health.dto'
import { HomeDto } from '@rozumari/contract/home/dto/home.dto'
import * as Effect from 'effect/Effect'
import * as HttpApiBuilder from 'effect/unstable/httpapi/HttpApiBuilder'

import { HealthUseCase } from '@/modules/home/application/use-case/health.use-case'

export const homeController = HttpApiBuilder.group(Api, 'home', (handlers) =>
  handlers
    .handle('index', () => Effect.succeed(HomeDto.make()))
    .handle('health', () =>
      HealthUseCase.use((s) => s.execute()).pipe(
        Effect.map((data) => HealthDto.make({ data }))
      )
    )
)
