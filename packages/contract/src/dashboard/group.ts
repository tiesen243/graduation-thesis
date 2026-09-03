import * as HttpApiEndpoint from 'effect/unstable/httpapi/HttpApiEndpoint'
import * as HttpApiGroup from 'effect/unstable/httpapi/HttpApiGroup'

import { AdminMiddleware, AuthMiddleware } from '@/auth/middleware'
import { AdminDto } from '@/dashboard/dto/admin.dto'
import { UserDto } from '@/dashboard/dto/user.dto'

export class DashboardGroup extends HttpApiGroup.make('dashboard')
  .add(
    HttpApiEndpoint.get('admin', '/admin', {
      success: AdminDto,
    }).middleware(AdminMiddleware)
  )

  .add(
    HttpApiEndpoint.get('user', '/user', {
      success: UserDto,
    }).middleware(AuthMiddleware)
  )

  .middleware(AuthMiddleware)

  .prefix('/api/dashboard') {}
