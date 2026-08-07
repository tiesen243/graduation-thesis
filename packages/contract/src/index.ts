import * as HttpApi from 'effect/unstable/httpapi/HttpApi'

import { AuthGroup, OAuthGroup } from '@/auth/group'
import { DeviceGroup } from '@/device/group'
import { HomeGroup } from '@/home/group'
import { UserGroup } from '@/user/group'

export class Api extends HttpApi.make('api')

  .add(AuthGroup)

  .add(OAuthGroup)

  .add(UserGroup)

  .add(DeviceGroup)

  .add(HomeGroup) {}
