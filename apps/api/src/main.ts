import { Bootstrap } from '@/bootstrap'
import { AuthController } from '@/modules/auth/presentation/auth.controller'
import { UserController } from '@/modules/user/presentation/user.controller'
import { errorHandle } from '@/plugins/error-handle'

const server = Bootstrap.create({
  persistenceDriver: 'drizzle',
})

  .use(errorHandle)

  .use(AuthController)
  .use(UserController)

  .compile()

export default {
  fetch: server.fetch,
}
