// oxlint-disable max-classes-per-file

import * as HttpRouter from 'effect/unstable/http/HttpRouter'

import { AppModule } from '@/modules/app.module'

const application = AppModule.create({ persistentDriver: 'in-memory' })

export default {
  fetch: HttpRouter.toWebHandler(application).handler,

  development: process.env.NODE_ENV !== 'production' && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
}
