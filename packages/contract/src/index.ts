import * as HttpApi from 'effect/unstable/httpapi/HttpApi'

import { AuthGroup } from '@/auth/group.auth'
import { OAuthGroup } from '@/auth/group.oauth'
import { DeviceGroup } from '@/device/group.device'
import { IotGroup } from '@/device/group.iot'
import { HomeGroup } from '@/home/group'
import { UserGroup } from '@/user/group'

export class Api extends HttpApi.make('api')

  .add(AuthGroup)
  .add(OAuthGroup)

  .add(UserGroup)

  .add(DeviceGroup)
  .add(IotGroup)

  .add(HomeGroup) {}
