import * as Schema from 'effect/Schema'

import { Http } from '@/shared/http'

export class HealthOutputDto extends Http.extend<HealthOutputDto>(
  'home/application/HealthOutputDto'
)({
  data: Schema.Struct({
    status: Schema.String,
    uptime: Schema.Number,
    environment: Schema.String,
    memory: Schema.Struct({
      used: Schema.Number,
      total: Schema.Number,
      unit: Schema.String,
    }),
    cpu: Schema.Struct({
      user: Schema.Number,
      system: Schema.Number,
    }),
  }),
}) {}
