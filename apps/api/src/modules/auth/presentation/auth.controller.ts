import { Elysia } from 'elysia'

import { LoginDto } from '@/modules/auth/application/dto/login.dto'
import { loginUseCase } from '@/modules/auth/application/use-case/login.use-case'

export const AuthController = new Elysia({
  name: 'modules/auth/presentation/AuthController',
  prefix: '/api/auth',
})

  .post('/login', { body: LoginDto.input }, ({ body }) => loginUseCase(body))
