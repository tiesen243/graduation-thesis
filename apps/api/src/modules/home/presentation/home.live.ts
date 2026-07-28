import { Effect } from 'effect'
import { HttpApiBuilder } from 'effect/unstable/httpapi'

import { Api } from '@/api'
import { HealthOutputDto } from '@/modules/home/application/dto/health.dto'
import { HomeOutputDto } from '@/modules/home/application/dto/home.dto'

export const HomeLive = HttpApiBuilder.group(Api, 'home', (handlers) =>
  handlers
    .handle('index', () =>
      Effect.succeed(
        HomeOutputDto.make({
          message: 'Welcome to the API',
        })
      )
    )

    .handle('health', () =>
      Effect.succeed(
        HealthOutputDto.make({
          data: {
            status: 'healthy',
            uptime: process.uptime(),
            environment: process.env.NODE_ENV ?? 'development',
            memory: {
              used: process.memoryUsage().heapUsed / 1024 / 1024,
              total: process.memoryUsage().heapTotal / 1024 / 1024,
              unit: 'MB',
            },
            cpu: process.cpuUsage(),
          },
        })
      )
    )

    .handle('echo', ({ payload }) => Effect.succeed(payload))
)
