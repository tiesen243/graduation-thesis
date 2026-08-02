import * as HttpApi from 'effect/unstable/httpapi/HttpApi'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import { AuthGroup } from '@/modules/auth/presentation/http/auth.group'
import { HomeGroup } from '@/modules/home/presentation/http/home.group'
import { UserGroup } from '@/modules/user/presentation/http/user.group'

import pkgJson from '../package.json' with { type: 'json' }

export class Api extends HttpApi.make('Api')
  .add(HomeGroup)
  .add(UserGroup)
  .add(AuthGroup)

  .annotateMerge(
    OpenApi.annotations({
      title: pkgJson.name,
      version: pkgJson.version,
      license: {
        name: 'Apache-2.0',
        url: 'https://raw.githubusercontent.com/tiesen243/graduation-thesis/refs/heads/main/LICENSE',
      },
    })
  ) {}

export { AuthMiddleware } from '@/modules/auth/presentation/http/auth.middleware'
