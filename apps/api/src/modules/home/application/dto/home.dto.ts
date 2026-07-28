import { Http } from '@/shared/http'

export class HomeOutputDto extends Http.extend<HomeOutputDto>(
  'home/application/HomeOutputDto'
)({}) {}
