export interface UserProfile {
  id: number
  fullName: string
  email: string
  createdAt: string
}

export interface AuthResponse {
  user: UserProfile
}

export interface AuthErrorResponse {
  error?: string
  details?: Record<string, string>
}
