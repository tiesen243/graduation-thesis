import * as HttpApi from 'effect/unstable/httpapi/HttpApi'

import { AuthGroup } from '@/auth/group.auth'
import { OAuthGroup } from '@/auth/group.oauth'
import { DeviceGroup } from '@/device/group'
import { DeviceIotGroup } from '@/device/group.iot'
import { HomeGroup } from '@/home/group'
import { ScheduleGroup } from '@/schedule/group'
import { ScheduleIotGroup } from '@/schedule/group.iot'
import { UserGroup } from '@/user/group'

export class Api extends HttpApi.make('api')

  .add(AuthGroup)
  .add(OAuthGroup)

  .add(UserGroup)

  .add(DeviceGroup)
  .add(DeviceIotGroup)

  .add(ScheduleGroup)
  .add(ScheduleIotGroup)

  .add(HomeGroup) {}
