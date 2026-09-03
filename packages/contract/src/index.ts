import * as HttpApi from 'effect/unstable/httpapi/HttpApi'

import { AuthGroup } from '@/auth/group.auth'
import { OAuthGroup } from '@/auth/group.oauth'
import { DashboardGroup } from '@/dashboard/group'
import { DeviceGroup } from '@/device/group'
import { DeviceIoTGroup } from '@/device/group.iot'
import { HomeGroup } from '@/home/group'
import { NotificationGroup } from '@/notification/group'
import { NotificationIoTGroup } from '@/notification/group.iot'
import { ScheduleGroup } from '@/schedule/group'
import { ScheduleIoTGroup } from '@/schedule/group.iot'
import { UserGroup } from '@/user/group'

export class Api extends HttpApi.make('api')

  .add(AuthGroup)
  .add(OAuthGroup)

  .add(UserGroup)

  .add(DeviceGroup)
  .add(DeviceIoTGroup)

  .add(ScheduleGroup)
  .add(ScheduleIoTGroup)

  .add(NotificationGroup)
  .add(NotificationIoTGroup)

  .add(DashboardGroup)

  .add(HomeGroup) {}
