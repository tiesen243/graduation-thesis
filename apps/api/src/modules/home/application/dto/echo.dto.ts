import { Schema } from 'effect'

export class EchoDto extends Schema.Struct({
  message: Schema.String,
}) {}
