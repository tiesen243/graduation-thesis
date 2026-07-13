import { Elysia } from 'elysia'

import { AuthMiddleware } from '@/modules/auth/presentation/auth.middleware'
import { GetAllDto } from '@/modules/user/application/dto/get-all.dto'
import { GetOneDto } from '@/modules/user/application/dto/get-one.dto'
import { getAllUseCase } from '@/modules/user/application/use-case/get-all.use-case'
import { getOneUseCase } from '@/modules/user/application/use-case/get-one.use-case'

export const UserController = new Elysia({
  name: 'modules/user/presentation/UserController',
  prefix: '/api/users',
})
  .use(AuthMiddleware)

  .get('/', { auth: 'admin', query: GetAllDto.input }, ({ query }) =>
    getAllUseCase(query)
  )

  .get('/:id', { auth: 'admin', params: GetOneDto.input }, ({ params }) =>
    getOneUseCase(params)
  )
