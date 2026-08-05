import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { HealthDto } from '@/home/dto/health.dto'
import { HomeDto } from '@/home/dto/home.dto'

export class HomeGroup extends HttpApiGroup.make('home')
  .add(
    HttpApiEndpoint.get('index', '/', {
      success: HomeDto,
    })
  )

  .add(
    HttpApiEndpoint.get('health', '/health', {
      success: HealthDto,
    })
  ) {}
