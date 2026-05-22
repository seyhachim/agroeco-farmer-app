export interface User {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  session: any;
  error: Error | null;
}
