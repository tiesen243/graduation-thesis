import * as HttpApi from 'effect/unstable/httpapi/HttpApi'

import { AuthGroup } from '@/auth/group'
import { HomeGroup } from '@/home/group'
import { UserGroup } from '@/user/group'

export class Api extends HttpApi.make('api')

  .add(AuthGroup)

  .add(UserGroup)

  .add(HomeGroup) {}
