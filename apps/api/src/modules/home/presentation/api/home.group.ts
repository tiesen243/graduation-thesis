// oxlint-disable max-classes-per-file

import * as Schema from 'effect/Schema'
import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { HealthDto } from '@/modules/home/application/dto/health.dto'
import { ApiResponseSchema } from '@/shared/schema'

export class HomeSuccess extends Schema.TaggedClass<HomeSuccess>()(
  'home/presentation/HomeSuccess',
  ApiResponseSchema(Schema.Null)
) {}

export class HealthSuccess extends Schema.TaggedClass<HealthSuccess>()(
  'home/presentation/HealthSuccess',
  ApiResponseSchema(HealthDto.Output)
) {}

export class HomeGroup extends HttpApiGroup.make('home')
  .add(
    HttpApiEndpoint.get('index', '/', {
      success: HomeSuccess,
    })
  )

  .add(
    HttpApiEndpoint.get('health', '/health', {
      success: HealthSuccess,
    })
  ) {}
