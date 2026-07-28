// oxlint-disable max-classes-per-file

import * as HttpRouter from 'effect/unstable/http/HttpRouter'

import { AppModule } from '@/modules/app.module'

const program = HttpRouter.toWebHandler(
  AppModule.create({ persistentDriver: 'in-memory' })
)

export default {
  fetch: program.handler,
  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
}
