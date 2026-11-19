import type { AuthErrorResponse, AuthResponse, UserProfile } from '../types/auth'

export class AuthApiError extends Error {
  public readonly status: number
  public readonly details?: Record<string, string>

  constructor(
    message: string,
    status: number,
    details?: Record<string, string>,
  ) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
    this.details = details
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isUserProfile(value: unknown): value is UserProfile {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.fullName === 'string' &&
    typeof value.email === 'string' &&
    typeof value.createdAt === 'string'
  )
}

function parseAuthResponse(value: unknown): AuthResponse {
  if (!isRecord(value) || !isUserProfile(value.user)) {
    throw new AuthApiError('MANORA returned an invalid response.', 502)
  }
  return { user: value.user }
}

function parseErrorResponse(value: unknown): AuthErrorResponse {
  if (!isRecord(value)) return {}

  const details = isRecord(value.details)
    ? Object.fromEntries(
        Object.entries(value.details).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
    : undefined

  return {
    error: typeof value.error === 'string' ? value.error : undefined,
    details,
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  parse: (body: unknown) => T = (body) => body as T,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/auth${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  } catch {
    throw new AuthApiError('Could not connect to MANORA. Please try again.', 0)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const body: unknown = await response.json()
  if (!response.ok) {
    const errorBody = parseErrorResponse(body)
    throw new AuthApiError(
      errorBody.error ?? 'Something went wrong. Please try again.',
      response.status,
      errorBody.details,
    )
  }

  return parse(body)
}

export function register(
  fullName: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return request(
    '/register',
    {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    },
    parseAuthResponse,
  )
}

export function login(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthResponse> {
  return request(
    '/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    },
    parseAuthResponse,
  )
}

export function getCurrentUser(): Promise<AuthResponse> {
  return request('/me', undefined, parseAuthResponse)
}

export function logout(): Promise<void> {
  return request<void>('/logout', { method: 'POST' }, () => undefined)
}
