import { Data } from 'effect'

export interface IHttp {
  status: number
  message: string
  data: unknown | null
  error: unknown | null
  timestamp: Date
}

export class Http extends Data.TaggedError('shared/Http')<IHttp> {
  public constructor(props: Partial<Omit<IHttp, 'timestamp'>>) {
    super({
      status: props.status ?? 200,
      message: props.message ?? 'Resource fetched successfully',
      data: props.data ?? null,
      error: props.error ?? null,
      timestamp: new Date(),
    })
  }

  public toResponse() {
    const { _tag, status, message, ...rest } = this

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    if (status === 302) headers.set('Location', this.message)

    return Response.json({ status, message, ...rest }, { status, headers })
  }

  public static redirect(url: string): Http {
    return new Http({ status: 302, message: url })
  }

  // --- 4xx Client Errors ---

  public static badRequest(message: string, error?: unknown): Http {
    return new Http({ status: 400, message, error: error ?? null })
  }

  public static unauthorized(message: string, error?: unknown): Http {
    return new Http({ status: 401, message, error: error ?? null })
  }

  public static forbidden(message: string, error?: unknown): Http {
    return new Http({ status: 403, message, error: error ?? null })
  }

  public static notFound(message: string, error?: unknown): Http {
    return new Http({ status: 404, message, error: error ?? null })
  }

  // --- 5xx Server Errors ---

  public static internalServerError(message: string, error?: unknown): Http {
    return new Http({ status: 500, message, error: error ?? null })
  }
}
