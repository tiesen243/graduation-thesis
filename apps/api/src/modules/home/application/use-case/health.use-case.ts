import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import type { HealthDto } from '@/modules/home/application/dto/health.dto'

export class HealthUseCase extends Context.Service<
  HealthUseCase,
  {
    execute: (input: HealthDto.Input) => Effect.Effect<HealthDto.Output>
  }
>()('home/application/HealthUseCase', {
  make: Effect.succeed({
    execute: () =>
      Effect.succeed({
        status: 'healthy',
        environment: process.env.NODE_ENV ?? 'development',
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed / 1024 / 1024,
          total: process.memoryUsage().heapTotal / 1024 / 1024,
          unit: 'MB',
        },
        cpu: process.cpuUsage(),
      }),
  }),
}) {
  public static readonly layer = Layer.effect(this, this.make)
}
