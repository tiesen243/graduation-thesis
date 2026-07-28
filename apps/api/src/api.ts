import * as HttpApi from 'effect/unstable/httpapi/HttpApi'
import * as OpenApi from 'effect/unstable/httpapi/OpenApi'

import { HomeController } from '@/modules/home/presentation/home.controller'
import { UserController } from '@/modules/user/presentation/user.controller'

import pkgJson from '../package.json' with { type: 'json' }

export class Api extends HttpApi.make('Api')
  .add(HomeController)
  .add(UserController)
  .annotateMerge(
    OpenApi.annotations({ title: pkgJson.name, version: pkgJson.version })
  ) {}
