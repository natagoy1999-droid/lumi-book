export type ApiClientOptions = {
  baseUrl?: string
  getAuthToken?: () => string | null
}

export type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number }

export class ApiClient {
  private baseUrl: string
  private getAuthToken?: () => string | null

  constructor(opts: ApiClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? '').replace(/\/+$/, '')
    this.getAuthToken = opts.getAuthToken
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    const headers = new Headers(init.headers ?? {})
    headers.set('accept', 'application/json')
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json')
    const token = this.getAuthToken?.()
    if (token) headers.set('authorization', `Bearer ${token}`)

    try {
      const res = await fetch(url, { ...init, headers })
      const status = res.status
      const text = await res.text()
      const json = text ? (JSON.parse(text) as unknown) : null
      if (!res.ok) {
        const msg = typeof (json as any)?.error === 'string' ? (json as any).error : res.statusText
        return { ok: false, error: msg || 'Request failed', status }
      }
      return { ok: true, data: json as T, status }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Network error', status: 0 }
    }
  }
}

