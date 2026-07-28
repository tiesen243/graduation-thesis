import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { EchoDto } from '@/modules/home/application/dto/echo.dto'
import { HealthOutputDto } from '@/modules/home/application/dto/health.dto'
import { HomeOutputDto } from '@/modules/home/application/dto/home.dto'

export class HomeController extends HttpApiGroup.make('home')
  .add(HttpApiEndpoint.get('index', '/', { success: HomeOutputDto }))

  .add(HttpApiEndpoint.get('health', '/health', { success: HealthOutputDto }))

  .add(
    HttpApiEndpoint.post('echo', '/echo', {
      payload: EchoDto,
      success: EchoDto,
    })
  ) {}
