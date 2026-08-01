import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { HealthDto } from '@/modules/home/application/dto/health.dto'
import { Http } from '@/shared/http'

export class HomeGroup extends HttpApiGroup.make('home')
  .add(HttpApiEndpoint.get('index', '/', { success: Http(Schema.Null) }))

  .add(
    HttpApiEndpoint.get('health', '/health', {
      success: Http(HealthDto.Output),
    })
  ) {}
